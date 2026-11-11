require "rails_helper"
RSpec.describe "Workspace API", type: :request do
  let!(:account) { Account.create!(name: "Workspace") }
  let!(:user) { account.users.create!(name: "Owner", email: "owner@example.test", password: "a-strong-password", role: "owner") }
  let!(:service) { account.services.create!(name: "Consultation", duration_minutes: 60, price_cents: 15000) }
  let!(:professional) { account.professionals.create!(name: "Marina") }
  let(:headers) { { "Authorization" => "Bearer #{Session.issue!(user)}" } }
  let(:start) { 2.days.from_now.in_time_zone(account.time_zone).change(hour: 10, min: 0, sec: 0) }
  let(:data) { { customer_name: "Ana", customer_email: "ana@example.test", service_id: service.id, professional_id: professional.id, starts_at: start.iso8601 } }
  it "requires authentication" do
    get "/api/bookings"
    expect(response).to have_http_status(:unauthorized)
  end
  it "logs in, returns the user, and revokes a session" do
    post "/api/session", params: { email: user.email, password: "a-strong-password" }
    expect(response).to have_http_status(:created)
    auth = { "Authorization" => "Bearer #{response.parsed_body.fetch('token')}" }
    get "/api/session", headers: auth
    expect(response.parsed_body.dig("user", "role")).to eq("owner")
    delete "/api/session", headers: auth
    get "/api/session", headers: auth
    expect(response).to have_http_status(:unauthorized)
  end
  it "rejects expired sessions and wrong passwords" do
    user.sessions.create!(token_digest: Digest::SHA256.hexdigest("expired"), expires_at: 1.minute.ago)
    get "/api/session", headers: { "Authorization" => "Bearer expired" }
    expect(response).to have_http_status(:unauthorized)
    post "/api/session", params: { email: user.email, password: "wrong" }
    expect(response).to have_http_status(:unauthorized)
  end
  it "creates bookings with server-derived prices and end times" do
    post "/api/bookings", params: { booking: data.merge(price_cents: 1, status: "completed") }, headers: headers
    expect(response).to have_http_status(:created)
    expect(response.parsed_body).to include("price_cents" => 15000, "status" => "confirmed")
    expect(Booking.last.ends_at - Booking.last.starts_at).to eq(3600)
  end
  it "rejects overlap but allows adjacent appointments and reuse after cancellation" do
    post "/api/bookings", params: { booking: data }, headers: headers
    id = response.parsed_body.fetch("id")
    post "/api/bookings", params: { booking: data.merge(starts_at: (start + 30.minutes).iso8601) }, headers: headers
    expect(response).to have_http_status(:unprocessable_entity)
    post "/api/bookings", params: { booking: data.merge(starts_at: (start + 1.hour).iso8601) }, headers: headers
    expect(response).to have_http_status(:created)
    patch "/api/bookings/#{id}", params: { booking: { status: "cancelled" } }, headers: headers
    expect(response).to have_http_status(:ok)
    post "/api/bookings", params: { booking: data }, headers: headers
    expect(response).to have_http_status(:created)
  end
  it "prevents overlap in PostgreSQL when validations are bypassed" do
    booking = account.bookings.create!(data.except(:service_id, :professional_id).merge(service: service, professional: professional))
    duplicate = booking.attributes.except("id", "created_at", "updated_at")
    expect { Booking.transaction(requires_new: true) { Booking.insert_all!([duplicate]) } }.to raise_error(ActiveRecord::StatementInvalid) { |error| expect(error.cause).to be_a(PG::ExclusionViolation) }
  end
  it "isolates workspace lists and foreign IDs" do
    other = Account.create!(name: "Other")
    other_service = other.services.create!(name: "Private", duration_minutes: 30, price_cents: 9000)
    get "/api/services", headers: headers
    expect(response.parsed_body.map { |x| x["id"] }).not_to include(other_service.id)
    post "/api/bookings", params: { booking: data.merge(service_id: other_service.id) }, headers: headers
    expect(response).to have_http_status(:not_found)
    other_booking = other.bookings.create!(service: other_service, professional: other.professionals.create!(name: "Other"), customer_name: "Private", customer_email: "private@example.test", starts_at: start)
    patch "/api/bookings/#{other_booking.id}", params: { booking: { status: "cancelled" } }, headers: headers
    expect(response).to have_http_status(:not_found)
    get "/api/bookings", params: { date: start.to_date.iso8601 }, headers: headers
    expect(response.parsed_body).to eq([])
  end
  it "allows staff to read but forbids catalog changes" do
    user.update!(role: "staff")
    post "/api/services", params: { service: { name: "Forbidden", duration_minutes: 30, price_cents: 1000 } }, headers: headers
    expect(response).to have_http_status(:forbidden)
    post "/api/professionals", params: { professional: { name: "Forbidden" } }, headers: headers
    expect(response).to have_http_status(:forbidden)
    get "/api/services", headers: headers
    expect(response).to have_http_status(:ok)
  end
  it "rejects past times, outside hours, invalid emails and dates" do
    [1.day.ago, start.change(hour: 7), start.change(hour: 18)].each do |time|
      post "/api/bookings", params: { booking: data.merge(starts_at: time.iso8601) }, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
    post "/api/bookings", params: { booking: data.merge(customer_email: "invalid") }, headers: headers
    expect(response).to have_http_status(:unprocessable_entity)
    get "/api/bookings", params: { date: "wrong" }, headers: headers
    expect(response).to have_http_status(:bad_request)
  end
  it "does not complete future bookings or reopen terminal appointments" do
    post "/api/bookings", params: { booking: data }, headers: headers
    id = response.parsed_body.fetch("id")
    patch "/api/bookings/#{id}", params: { booking: { status: "completed" } }, headers: headers
    expect(response).to have_http_status(:unprocessable_entity)
    travel_to(start + 2.hours) do
      patch "/api/bookings/#{id}", params: { booking: { status: "completed" } }, headers: { "Authorization" => "Bearer #{Session.issue!(user)}" }
      expect(response).to have_http_status(:ok)
    end
    patch "/api/bookings/#{id}", params: { booking: { status: "confirmed" } }, headers: headers
    expect(response).to have_http_status(:unprocessable_entity)
  end
  it "allows an appointment ending exactly at closing time, but rejects one ending later" do
    post "/api/bookings", params: { booking: data.merge(starts_at: start.change(hour: 17).iso8601) }, headers: headers
    expect(response).to have_http_status(:created)
    post "/api/bookings", params: { booking: data.merge(starts_at: start.change(hour: 17, min: 30).iso8601) }, headers: headers
    expect(response).to have_http_status(:unprocessable_entity)
  end
  it "allows simultaneous bookings for different professionals" do
    second = account.professionals.create!(name: "Another professional")
    [professional.id, second.id].each do |id|
      post "/api/bookings", params: { booking: data.merge(professional_id: id) }, headers: headers
      expect(response).to have_http_status(:created)
    end
  end

end

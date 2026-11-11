abort "Demo seed is disabled in production" if Rails.env.production?
account = Account.find_or_create_by!(name: "Studio Aurora")
password = ENV.fetch("DEMO_PASSWORD", "Slotwise-demo-2026!")
User.find_or_create_by!(email: "owner@slotwise.test") { |u| u.assign_attributes(account: account, name: "Alex Morgan", role: "owner", password: password) }
User.find_or_create_by!(email: "staff@slotwise.test") { |u| u.assign_attributes(account: account, name: "Sam Rivera", role: "staff", password: password) }
[["Consultoria inicial", 60, 15000], ["Sessão de acompanhamento", 30, 8500], ["Atendimento completo", 90, 22000]].each do |name, minutes, cents|
  account.services.find_or_create_by!(name: name) { |s| s.assign_attributes(duration_minutes: minutes, price_cents: cents) }
end
[["Marina Costa", "Consultoria"], ["Lucas Almeida", "Atendimento especializado"], ["Beatriz Santos", "Acompanhamento"]].each do |name, specialty|
  account.professionals.find_or_create_by!(name: name) { |p| p.specialty = specialty }
end
zone = ActiveSupport::TimeZone[account.time_zone]
date = Time.current.in_time_zone(zone).to_date + 1
[9, 10, 14, 16].each_with_index do |hour, i|
  start = zone.local(date.year, date.month, date.day, hour)
  account.bookings.find_or_create_by!(starts_at: start, professional: account.professionals.order(:id)[i % 3]) do |b|
    b.assign_attributes(service: account.services.order(:id)[i % 3], customer_name: ["Ana Oliveira", "Pedro Lima", "Julia Rocha", "Rafael Souza"][i], customer_email: "client#{i}@example.test", notes: "Dados fictícios para demonstração")
  end
end
puts "Demo ready: owner@slotwise.test / staff@slotwise.test; password comes from DEMO_PASSWORD (documented local default)."

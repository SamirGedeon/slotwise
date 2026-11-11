module Api
  class BookingsController < ApplicationController
    def index
      date = Date.iso8601(params.fetch(:date, Date.current.iso8601))
      zone = ActiveSupport::TimeZone[current_account.time_zone]
      from = zone.local(date.year, date.month, date.day)
      bookings = current_account.bookings.includes(:service, :professional).where(starts_at: from...from.advance(days: 1)).order(:starts_at)
      render json: bookings
    rescue Date::Error, TypeError
      render json: { errors: ["date must use YYYY-MM-DD"] }, status: :bad_request
    end
    def create
      data = params.require(:booking).permit(:customer_name, :customer_email, :starts_at, :notes, :service_id, :professional_id)
      service = current_account.services.find(data.delete(:service_id))
      professional = current_account.professionals.find(data.delete(:professional_id))
      booking = current_account.bookings.create!(data.merge(service: service, professional: professional, status: "confirmed"))
      render json: booking, status: :created
    end
    def update
      booking = current_account.bookings.find(params[:id])
      booking.with_lock { booking.update!(params.require(:booking).permit(:status)) }
      render json: booking
    end
  end
end

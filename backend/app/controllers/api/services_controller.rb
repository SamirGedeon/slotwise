module Api
  class ServicesController < ApplicationController
    before_action :require_owner!, only: :create
    def index
      render json: current_account.services.order(:name).as_json(only: %i[id name duration_minutes price_cents])
    end
    def create
      record = current_account.services.create!(params.require(:service).permit(:name, :duration_minutes, :price_cents))
      render json: record.as_json(only: %i[id name duration_minutes price_cents]), status: :created
    end
  end
end

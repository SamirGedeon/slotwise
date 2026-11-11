module Api
  class ProfessionalsController < ApplicationController
    before_action :require_owner!, only: :create
    def index
      render json: current_account.professionals.order(:name).as_json(only: %i[id name specialty])
    end
    def create
      record = current_account.professionals.create!(params.require(:professional).permit(:name, :specialty))
      render json: record.as_json(only: %i[id name specialty]), status: :created
    end
  end
end

class ApplicationController < ActionController::API
  before_action :authenticate!
  rescue_from ActiveRecord::RecordNotFound, with: -> { render json: { errors: ["Resource not found"] }, status: :not_found }
  rescue_from ActiveRecord::RecordInvalid, with: ->(e) { render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity }
  rescue_from ActionController::ParameterMissing, with: ->(e) { render json: { errors: [e.message] }, status: :bad_request }
  rescue_from ActiveRecord::StatementInvalid, with: :database_error

  private

  def authenticate!
    token = request.authorization.to_s.delete_prefix("Bearer ")
    @session = Session.includes(:user).where("expires_at > ?", Time.current).find_by(token_digest: Digest::SHA256.hexdigest(token)) if token.present?
    render json: { errors: ["Please sign in again"] }, status: :unauthorized unless @session
  end
  def current_user = @session.user
  def current_account = current_user.account
  def require_owner!
    render json: { errors: ["Only workspace owners can perform this action"] }, status: :forbidden unless current_user.role == "owner"
  end
  def database_error(error)
    if error.cause.is_a?(PG::ExclusionViolation)
      render json: { errors: ["This time was just booked. Please choose another time."] }, status: :conflict
    else
      raise error
    end
  end
end

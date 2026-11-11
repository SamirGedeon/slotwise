class Booking < ApplicationRecord
  belongs_to :account
  belongs_to :service
  belongs_to :professional
  before_validation :snapshot_service, on: :create
  validates :customer_name, presence: true, length: { maximum: 100 }
  validates :customer_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }, length: { maximum: 254 }
  validates :starts_at, :ends_at, presence: true
  validates :notes, length: { maximum: 2000 }
  validates :status, inclusion: { in: %w[confirmed completed cancelled] }
  validate :same_account
  validate :schedule_rules, on: :create
  validate :status_transition, on: :update
  scope :active, -> { where.not(status: "cancelled") }

  def as_json(options = {})
    super(only: %i[id customer_name customer_email starts_at ends_at status price_cents notes service_id professional_id])
      .merge(service_name: service.name, professional_name: professional.name)
  end

  private

  def snapshot_service
    return unless service && starts_at
    self.ends_at = starts_at + service.duration_minutes.minutes
    self.price_cents = service.price_cents
  end

  def same_account
    errors.add(:base, "Service and professional must belong to this workspace") if
      service&.account_id != account_id || professional&.account_id != account_id
  end

  def schedule_rules
    return unless starts_at && ends_at && account
    errors.add(:starts_at, "must be in the future") if starts_at <= Time.current
    local_start = starts_at.in_time_zone(account.time_zone)
    local_end = ends_at.in_time_zone(account.time_zone)
    opening = local_start.change(hour: 8, min: 0, sec: 0)
    closing = local_start.change(hour: 18, min: 0, sec: 0)
    unless local_start >= opening && local_end <= closing
      errors.add(:starts_at, "must fit between 08:00 and 18:00 in the workspace time zone")
    end
    if professional && self.class.active.where(professional_id: professional_id).where("starts_at < ? AND ends_at > ?", ends_at, starts_at).exists?
      errors.add(:base, "This professional already has a booking at this time")
    end
  end

  def status_transition
    return unless will_save_change_to_status?
    errors.add(:status, "cannot change after completion or cancellation") unless status_in_database == "confirmed" && %w[completed cancelled].include?(status)
    errors.add(:status, "cannot complete a booking before it ends") if status == "completed" && ends_at > Time.current
  end
end

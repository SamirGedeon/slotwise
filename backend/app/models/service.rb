class Service < ApplicationRecord
  belongs_to :account
  has_many :bookings, dependent: :restrict_with_error
  validates :name, presence: true, length: { maximum: 100 }
  validates :duration_minutes, numericality: { only_integer: true, greater_than_or_equal_to: 15, less_than_or_equal_to: 240 }
  validates :price_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 100_000_000 }
end

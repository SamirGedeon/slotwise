class Professional < ApplicationRecord
  belongs_to :account
  has_many :bookings, dependent: :restrict_with_error
  validates :name, presence: true, length: { maximum: 100 }
  validates :specialty, length: { maximum: 100 }
end

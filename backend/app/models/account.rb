class Account < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :services, dependent: :destroy
  has_many :professionals, dependent: :destroy
  has_many :bookings, dependent: :destroy
  validates :name, presence: true
  validates :time_zone, inclusion: { in: TZInfo::Timezone.all_identifiers }
end

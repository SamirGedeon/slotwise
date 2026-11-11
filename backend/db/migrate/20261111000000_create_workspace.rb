class CreateWorkspace < ActiveRecord::Migration[7.2]
  def change
    enable_extension "btree_gist"
    create_table :accounts do |t|
      t.string :name, null: false
      t.string :time_zone, null: false, default: "America/Sao_Paulo"
      t.timestamps
    end
    create_table :users do |t|
      t.references :account, null: false, foreign_key: true
      t.string :name, null: false
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :role, null: false, default: "staff"
      t.timestamps
    end
    add_index :users, :email, unique: true
    add_check_constraint :users, "role IN ('owner', 'staff')", name: "valid_role"
    create_table :sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token_digest, null: false
      t.datetime :expires_at, null: false
      t.timestamps
    end
    add_index :sessions, :token_digest, unique: true
    create_table :services do |t|
      t.references :account, null: false, foreign_key: true
      t.string :name, null: false
      t.integer :duration_minutes, null: false
      t.integer :price_cents, null: false
      t.timestamps
    end
    add_check_constraint :services, "duration_minutes BETWEEN 15 AND 240 AND price_cents >= 0", name: "valid_service_values"
    create_table :professionals do |t|
      t.references :account, null: false, foreign_key: true
      t.string :name, null: false
      t.string :specialty
      t.timestamps
    end
    create_table :bookings do |t|
      t.references :account, null: false, foreign_key: true
      t.references :service, null: false, foreign_key: true
      t.references :professional, null: false, foreign_key: true
      t.string :customer_name, null: false
      t.string :customer_email, null: false
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.integer :price_cents, null: false
      t.string :status, null: false, default: "confirmed"
      t.text :notes
      t.timestamps
    end
    add_index :bookings, [:account_id, :starts_at]
    add_check_constraint :bookings, "ends_at > starts_at AND price_cents >= 0", name: "valid_booking_values"
    add_check_constraint :bookings, "status IN ('confirmed', 'completed', 'cancelled')", name: "valid_status"
    # Half-open intervals permit adjacent bookings; the constraint also protects concurrent requests.
    add_exclusion_constraint :bookings, "professional_id WITH =, tsrange(starts_at, ends_at, '[)') WITH &&",
      where: "status <> 'cancelled'", using: :gist, name: "no_overlapping_bookings"
  end
end

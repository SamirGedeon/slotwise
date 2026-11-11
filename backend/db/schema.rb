# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_11_11_000000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "btree_gist"
  enable_extension "plpgsql"

  create_table "accounts", force: :cascade do |t|
    t.string "name", null: false
    t.string "time_zone", default: "America/Sao_Paulo", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "bookings", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "service_id", null: false
    t.bigint "professional_id", null: false
    t.string "customer_name", null: false
    t.string "customer_email", null: false
    t.datetime "starts_at", null: false
    t.datetime "ends_at", null: false
    t.integer "price_cents", null: false
    t.string "status", default: "confirmed", null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "starts_at"], name: "index_bookings_on_account_id_and_starts_at"
    t.index ["account_id"], name: "index_bookings_on_account_id"
    t.index ["professional_id"], name: "index_bookings_on_professional_id"
    t.index ["service_id"], name: "index_bookings_on_service_id"
    t.check_constraint "ends_at > starts_at AND price_cents >= 0", name: "valid_booking_values"
    t.check_constraint "status::text = ANY (ARRAY['confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])", name: "valid_status"
    t.exclusion_constraint "professional_id WITH =, tsrange(starts_at, ends_at, '[)'::text) WITH &&", where: "(status)::text <> 'cancelled'::text", using: :gist, name: "no_overlapping_bookings"
  end

  create_table "professionals", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.string "name", null: false
    t.string "specialty"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_professionals_on_account_id"
  end

  create_table "services", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.string "name", null: false
    t.integer "duration_minutes", null: false
    t.integer "price_cents", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_services_on_account_id"
    t.check_constraint "duration_minutes >= 15 AND duration_minutes <= 240 AND price_cents >= 0", name: "valid_service_values"
  end

  create_table "sessions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token_digest", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token_digest"], name: "index_sessions_on_token_digest", unique: true
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.string "name", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "role", default: "staff", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_users_on_account_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.check_constraint "role::text = ANY (ARRAY['owner'::character varying, 'staff'::character varying]::text[])", name: "valid_role"
  end

  add_foreign_key "bookings", "accounts"
  add_foreign_key "bookings", "professionals"
  add_foreign_key "bookings", "services"
  add_foreign_key "professionals", "accounts"
  add_foreign_key "services", "accounts"
  add_foreign_key "sessions", "users"
  add_foreign_key "users", "accounts"
end

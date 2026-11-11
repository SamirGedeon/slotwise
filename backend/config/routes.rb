Rails.application.routes.draw do
  get "/up", to: proc { [200, { "Content-Type" => "application/json" }, ['{"status":"ok"}']] }
  namespace :api do
    post "session", to: "sessions#create"
    get "session", to: "sessions#show"
    delete "session", to: "sessions#destroy"
    resources :services, only: %i[index create]
    resources :professionals, only: %i[index create]
    resources :bookings, only: %i[index create update]
  end
end

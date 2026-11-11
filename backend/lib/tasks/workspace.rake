namespace :workspace do
  desc "Create a first workspace owner from environment variables (no demo credentials)"
  task bootstrap: :environment do
    name = ENV.fetch("WORKSPACE_NAME")
    email = ENV.fetch("OWNER_EMAIL")
    password = ENV.fetch("OWNER_PASSWORD")
    Account.transaction do
      account = Account.create!(name: name, time_zone: ENV.fetch("WORKSPACE_TIME_ZONE", "America/Sao_Paulo"))
      account.users.create!(name: ENV.fetch("OWNER_NAME"), email: email, password: password, role: "owner")
    end
    puts "Workspace created. Sign in with the supplied owner credentials."
  end
end

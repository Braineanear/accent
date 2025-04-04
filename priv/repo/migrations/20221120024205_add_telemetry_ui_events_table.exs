defmodule Accent.Repo.Migrations.AddTelemetryUiEventsTable do
  @moduledoc false
  use Ecto.Migration

  alias TelemetryUI.Backend.EctoPostgres.Migrations

  @disable_ddl_transaction true
  @disable_migration_lock true

  def up do
    Migrations.up()
  end

  # We specify `version: 1` in `down`, ensuring that we'll roll all the way back down if
  # necessary, regardless of which version we've migrated `up` to.
  def down do
    Migrations.down(version: 1)
  end
end

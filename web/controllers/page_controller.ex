defmodule Affinaty.PageController do
  use Affinaty.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

  def plugin(conn, params) do
    # path = Enum.join(params["path"], "/")
    [ name | _ ] = params["path"]
    conn = put_layout conn, false
    render conn, "plugin.html", name: name
  end
end

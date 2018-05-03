defmodule Affinaty.PageController do
  use Affinaty.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

  def plugin(conn, params) do
    [ name | _ ] = params["path"]
    conn
    |> put_layout(false)
    |> render("plugin.html", name: name, description: "", author: "")
  end

  def time_machine(conn, params) do
    conn
    |> put_layout({Affinaty.Dispatch, "plugin.html"})
    |> render("time_machine.html", name: hd(params["path"]))
  end
end

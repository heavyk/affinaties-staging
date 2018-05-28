defmodule Affinaty.Dispatch do
  alias Affinaty.Router.Helpers, as: Routes
  use Marker

  template :plugin_page do
    html lang: "en" do
      head do
        meta charset: "utf-8"
        meta "http-equiv": "X-UA-Compatible", content: "IE=edge"
        meta name: "viewport", content: "width=device-width,initial-scale=1"
        # meta name: "description", content: @description
        # meta name: "author", content: @author

        title @name
        link rel: "stylesheet", href: Routes.static_path(@conn, "/plugins/" <> @name <> ".css")
      end
      body do
        div
        script src: Routes.static_path(@conn, "/plugins/plugger.js")
        script do
          render @name, assigns
        end
      end
    end
  end

  def render("plugin.html", assigns) do
    plugin_page(assigns) |> Marker.Compiler.compile()
  end

  def render(tpl, assigns) do
    params = Enum.map(assigns.conn.query_params, fn {k, v} -> {k, number_or_string(v)} end) |> Enum.into(%{})

    res = apply(Affinaty.Plugin, String.to_atom(tpl), [assigns])
    |> TimeMachine.Compiler.to_ast()
    |> ESTree.Tools.Generator.generate(false)

    {:safe, """
    // #{tpl}
    var #{tpl} = #{res};
    plugger(#{tpl}, #{Poison.encode!(params)})
    """}
  end

  defp number_or_string(str) do
    try do
      String.to_integer(str)
    rescue
      _ -> try do
        String.to_float(str)
      rescue
        _ -> try do
          cond do
            String.starts_with?(str, "0x") -> String.slice(str, 2, 100) |> String.to_integer(16)
            true -> str
          end
        rescue
          _ -> str
        end
      end
    end
  end
end

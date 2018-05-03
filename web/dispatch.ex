defmodule Affinaty.Dispatch do
  alias Affinaty.Router.Helpers, as: Routes
  use TimeMachine

  Marker.template :plugin do
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
        script do
          render @name, assigns
        end
      end
    end
  end

  def render("plugin.html", assigns) do
    plugin(assigns) |> Marker.Compiler.compile()
  end

  def render(tpl, args) do
    res = apply(Affinaty.Plugin, String.to_atom(tpl), [args])
    |> TimeMachine.Compiler.to_ast()
    |> ESTree.Tools.Generator.generate(false)
    {:safe, res}
  end
end

defmodule Affinaty.PageView do
  use Affinaty.Web, :view

  component :simple_list do
    ul for c <- @__content__, do: li c
  end

  template :index do
    fragment do
      div class: "jumbotron" do
        h2 gettext("Welcome to %{name}!", name: "Phoenix")
        p class: "lead" do
          "A productive web framework that"
          br
          "does not compromise speed and maintainability."
        end
      end
      div class: "row marketing" do
        div class: "col-lg-6" do
          h4 "Resources"
          simple_list do
            a "Guides", href: "http://phoenixframework.org/docs/overview"
            a "Docs", href: "https://hexdocs.pm/phoenix"
            a "Source", href: "https://github.com/phoenixframework/phoenix"
          end
        end
        div class: "col-lg-6" do
          h4 "Help"
          simple_list do
            a "Mailing list", href: "http://groups.google.com/group/phoenix-talk"
            a "#elixir-lang on freenode IRC", href: "http://webchat.freenode.net/?channels=elixir-lang"
            a "@elixirphoenix", href: "https://twitter.com/elixirphoenix"
          end
        end
      end
    end
  end

  def render("index.html", assigns) do
    index(assigns) |> Marker.Compiler.compile()
  end

  template :plugin do
    html lang: "en" do
      head do
        meta charset: "utf-8"
        meta "http-equiv": "X-UA-Compatible", content: "IE=edge"
        meta name: "viewport", content: "width=device-width, initial-scale=1"
        meta name: "description", content: @description
        meta name: "author", content: @author

        title @view_template #@title || @name
        link rel: "stylesheet", href: static_path(@conn, "/plugins/" <> @name <> ".css")
      end
      body do
        # render @view_module, @view_template, assigns
        script src: static_path(@conn, "/plugins/" <> @name <> ".js")
      end
    end
  end

  def render("plugin.html", assigns) do
    plugin(assigns) |> Marker.Compiler.compile()
  end
end

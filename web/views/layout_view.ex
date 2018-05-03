defmodule Affinaty.LayoutView do
  alias Affinaty.Router.Helpers, as: Routes
  use Affinaty.Web, :view

  Marker.template :app do
    html lang: "en" do
      head do
        meta charset: "utf-8"
        meta "http-equiv": "X-UA-Compatible", content: "IE=edge"
        meta name: "viewport", content: "width=device-width, initial-scale=1"
        meta name: "description", content: ""
        meta name: "author", content: ""

        title "Hello MarkerPhoenixExample!"
        link rel: "stylesheet", href: Routes.static_path(@conn, "/css/app.css")
        script defer: true, src: Routes.static_path(@conn, "/js/app.js")
      end
      body do
        div class: "container" do
          header class: "header" do
            nav role: "navigation" do
              ul class: "nav nav-pills pull-right" do
                li a("Get Started", href: "http://www.phoenixframework.org/docs")
              end
            end
            a href: "http://phoenixframework.org/", class: "phx-logo" do
              img src: Routes.static_path(@conn, "/images/phoenix.png"), alt: "Phoenix Framework Logo"
            end
          end

          p get_flash(@conn, :info), class: "alert alert-info", role: "alert"
          p get_flash(@conn, :error), class: "alert alert-danger", role: "alert"

          main role: "main" do
            render @view_module, @view_template, assigns
          end
        end
      end
    end
  end

  def render("app.html", assigns) do
    app(assigns) |> Marker.Compiler.compile()
  end
end

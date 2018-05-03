defmodule Affinaty.Plugin do
  use TimeMachine

  template :tpl_cod do
    div '.tpl_cod' do
      "condition (lala) is:"
      ~o(lala)
      " + (num) = "
      ~o(sum)
    end
  end

  template :tpl_obv do
    div '.tpl_obv' do
      'num is:'
      ~o(num)
      div '.click' do
        button "num++", boink: ~o(num) + 1
        button "num--", boink: ~o(num) - 1
      end
    end
  end

  template :tpl_boink do
    div '.tpl_boink' do
      div '.boink' do
        span "boinked: ", (if ~o(boinked), do: "YES!", else: "no...")
        button "boink", boink: ~o(boinked)
      end
      div '.press' do
        span "pressed: ", (if ~o(pressed), do: "YES!", else: "no...")
        button "press me", press: ~o(pressed)
      end
    end
  end

  template :tpl_words do
    div '.tpl_words' do
      div '.word-input' do
        input type: "text", value: ~o(w1), placeholder: "type a name..."
        span " and "
        input type: "text", value: ~o(w2), placeholder: "type a name..."
      end
      div (b ~o(w1)), " goes to the market"
      div (b ~o(w2)), " stays home"
      div (b ~o(w1)), " and ", (b ~o(w2)), " are not at the zoo"
    end
  end

  template :tpl_select do
    div '.tpl_select' do
      "selector: "
      select '.selector', value: ~o(selected) do
        option "please select...", disabled: true, selected: true, value: ""
        option "one", value: 1
        option "two", value: 2
        option "three", value: 3
        option "four", value: 4
      end
      input type: "text", value: ~o(selected), placeholder: "nothing selected yet..."
      " selected: "
      (b ~o(selected))
    end
  end

  # a recreation of the example in /src/plugins/plugger.js
  panel :plugin_demo do
    ~o(num) = 11
    ~o(sum) <~ ~o(num) + ~c(lala)
    ~o(boinked) = false
    ~o(pressed) = false
    div do
      h1 "simple plugin demo"
      hr()
      h3 "conditions, numbers, and transformations"
      tpl_cod()
      tpl_obv()
      hr()
      h3 "mouse / touch events"
      tpl_boink()
      hr()
      h3 "text input"
      tpl_words()
      hr()
      h3 "select boxes"
      tpl_select()
    end
  end
end

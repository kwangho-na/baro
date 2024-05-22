<div id="viewPort">
</div>


const Stage = window.Stage;
const { h, app: mount } = hyperapp;
/** @jsx h */

const stageApp = Stage({
  viewport: "#viewPort",
  transition: "lollipop"
});


Stage.defineView({
  id: "main",
  template: '<div class="stage-view main"></div>',
  factory: function(stageContext, viewUi) {
    const actions = {};
    let state = {
      transition: "slide"
    };
    return {
      showAbout() {
        // setTimeout(_ => {
          stageContext.pushView("about", {
            transition: state.transition
          });
        // }, 200)
      },
      setTransition(t) {
        state = {
          ...state,
          transition: t
        };
        this.update(state);
        this.showAbout();
      },
      render(state) {
        let items = [
          "slide", "slide-up", "slide-down",
          "fade", "fancy", "lollipop"
        ].map(t => {
          return (
            <li class={state.transition === t ? "widget selected" : "widget"}
              onclick={this.setTransition.bind(this, t)}>
              {t.toUpperCase()}
            </li>
          );
        });
        return (
          <div>
            <div class="summary">
              <h2>Main View</h2>
              <p>{state.message}</p>
            </div>
            <ul class="items">
              {items}
            </ul>
          </div>
        );
      },

      // Stage app lifecycle functions. All are optional
      initialize(viewOpts) {},
      activate(viewOpts) {
        state = {
          ...state,
          message: viewOpts.message
        };
        this.update(state);
      },
      update(viewOpts) {
        state = {
          ...state,
          message: viewOpts.message
        };
        // mount(ui, (ui = this.render(state)), viewUi);
        mount(state, actions, this.render.bind(this), viewUi);
      },
      deactivate(viewOpts) {},
      destroy() {}
    };
  }
});




Stage.defineView({
  id: "about",
  // Templates are optional
  // template: `<div class="stage-view about"></div>`,
  factory: function(stageContext, viewUi) {
    const actions = {
      showMain() {
        stageContext.popView({
          message: "Message from about view " + Date()
        });
      }
    };

    return {
      render(state, actions) {
        return (
          <div class="content">
            <h2>About View</h2>
            <p>
              Made with <a
                href="https://naikus.github.io/stage/dist/index.html"
                target="_blank">
                https://naikus.github.io/stage
              </a> 
            </p>
            <p>
              Also checkout my stage.js based <a target="_blank"
                href="https://codepen.io/naikus/project/full/AzkkER">codepen project</a>
            </p>
            <button class="primary inline" onclick={actions.showMain}>&#171; Back</button>
          </div>
        );
      },
      initialize() {
        viewUi.classList.add("about");
      },
      activate(viewOpts) {
        // mount(ui, (ui = this.render(viewOpts.message)), viewUi);
        mount(viewOpts.message, actions, this.render.bind(this), viewUi);
      }
    };
  }
});


// You can also specify remote views. i.e. the above views 
// can reside in their own files and lazily loaded
/*
 * Stage.view("about", "some/path.js");
 */

// OR Multiple remote views
/*
   Stage.views({
     "four": {
        path: "views/four/view-four.html"
      },
      "five": {
        path: "views/five.js",
        config: {
          "hello": "world"
        }
      }
   });
 */

// Push a view onto the Stage
setTimeout(() => {
  stageApp.pushView("main", {
    transition: "slide", 
    // transition: "lollipop" | "slide" | "fancy" | "slide-up" | "slide-down", 
    message: Date()
  });
}, 500);



body {
  font-family: sans-serif;
  font-size: 1em;
  padding: 20px 0;
  margin: 0;
  display: flex;
  justify-content: center;
  background: #90c5ff;
}
div.info {
  padding: 20px;
  line-height: 1.4em;
  background-color: rgba(0, 0, 0, 0.05);
}
#viewPort {
  background-color: #2333;
  position: relative;
  min-width: 280px;
  width: 26%;
  height: 532px;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  margin: 20px;
}
.stage-view {
  background-color: #345;
  color: #c6dbe4;
  border-radius: 4px;
}
.stage-view::-webkit-scrollbar {
  width: 5px;
  height: 8px;
  background-color: rgba(0, 0, 0, 0.1);
}
.stage-view::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
}
.stage-view > .content {
  padding: 25px;
}
.stage-view > .content h2 {
  margin-top: 0;
  text-transform: uppercase;
}
.stage-view.main {
  background: linear-gradient(45deg, #222222, #225588);
}
.stage-view.main .summary {
  padding: 20px 30px;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.stage-view.main .items {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.stage-view.main .widget {
  padding: 20px;
  /* background-color: rgba(0,0,0,0.1); */
  display: flex;
  justify-content: center;
  /* margin-bottom: 3%; */
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  /* border-radius: 2px; */
  cursor: pointer;
  transition: background-color 200ms ease;
}
.stage-view.main .widget.selected {
  background-color: rgba(245, 117, 117, 0.911);
  color: #fff;
}
.stage-view.about {
  background-color: #234;
}
a {
  background-color: #45b3e0;
  color: #fff;
  border-radius: 3px;
  display: inline-block;
  padding: 2px 5px;
  text-decoration: none;
}
a:hover {
  background-color: #239ed0;
}
button {
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background-color: rgba(245, 117, 117, 0.911);
  text-transform: uppercase;
  font-weight: bold;
  border-radius: 8px;
  border-bottom-width: 3px;
  color: #fff;
}

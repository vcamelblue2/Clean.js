// By Default:
// - React must be in window.React!
// - CLE must be in window.cle_lib

const CleInReact = {
  DEBUG: { ENABLED: false },

	nestedCleTag: "cleroot",

  deps: {
    react: {
      React: window.React,
      useState: window.React?.useState, 
      useRef: window.React?.useRef, 
      useEffect: window.React?.useEffect, 
    },
    cle: {
      RenderApp: window.cle_lib?.RenderApp
    }
  },

  manualSetup: (React, cle_lib )=>{
    if (React !== undefined){
      CleInReact.deps.react.React = React
      CleInReact.deps.react.useState = React.useState
      CleInReact.deps.react.useRef = React.useRef
      CleInReact.deps.react.useEffect = React.useEffect
    }
    if (cle_lib !== undefined) {
      CleInReact.deps.cle.RenderApp = cle_lib.RenderApp
    }
  }
}

const _debug = { log: (...args)=> CleInReact.DEBUG.ENABLED && console.log(...args) }


// HOOKS FOR MASHUPS
// TO BE USED INSIDE REACT

/**
 * - Setup and use any react props passed as they where in $.scope.xxx. Then use in cle as normal $.xxx and changes in cle deps system will be detected
 * - if cle should edit a react property use alsoSetter={true} and setup setter as: usedProps={{prop: [reactGetter, reactSetter]}}, otherwise set as usedProps={{prop: reactGetter }}
 */
const UseCle = ({def, alsoSetter=false, usedProps={}, autoDestroy=false})=>{
  const [app, setApp] = CleInReact.deps.react.useState(null)
  const [oldUsedProps, setOldUsedProps] = CleInReact.deps.react.useState(null)
  const el = CleInReact.deps.react.useRef(null)

  CleInReact.deps.react.useEffect(()=>{
    _debug.log(el, app)
    // on init generate cle app, add some hook to react
    if (app === null){
      const [tag, pureDef] = Object.entries(def)[0]
      Object.entries(usedProps).forEach(([pname, pvalue]) => {
        if (alsoSetter){
          pureDef["let_"+pname] = pvalue[0]
          pureDef["def_set_"+pname] = ($, ...v)=>pvalue[1](...v)
        }
        else {
          pureDef["let_"+pname] = pvalue
          // the set should be done using react!
        }
      }); 

      const cleApp = CleInReact.deps.cle.RenderApp( el.current, {[tag]: pureDef})
      setApp(cleApp)
      _debug.log(cleApp)

      setOldUsedProps(usedProps)
    }
    // on property changes
    else {
      _debug.log("property changes!!")
      Object.entries(usedProps).forEach(([upname, upval])=>{
        if (alsoSetter){
          if (upval[0] !== oldUsedProps[upname][0]){
            app.components_root.$this.this[upname]=upval[0]
          }
        } else {
          if (upval !== oldUsedProps[upname]){
            app.components_root.$this.this[upname]=upval
          }
        }
      })

      setOldUsedProps(usedProps)
    }

    if (autoDestroy){
      return ()=>app?.destroy()
    }

  }, [def, ...(alsoSetter ? Object.values(usedProps).map(up=>up[0]) : [...Object.values(usedProps)])])

  // return <cleroot ref={el}></cleroot>
  return  CleInReact.deps.react.React.createElement(CleInReact.nestedCleTag, {ref: el})
}

// To fullrefresh on eache react rendering
const UseDumbCle = ({def})=>{
  const [app, setApp] = CleInReact.deps.react.useState(null)
  const el = CleInReact.deps.react.useRef(null)

  CleInReact.deps.react.useEffect(()=>{
    _debug.log(el, app)
    if (app !== null){
      app?.destroy()
      setApp(null)
    }
    setApp(CleInReact.deps.cle.RenderApp( el.current, def))
  }, [def])

  // return <div ref={el}></div>
  return  CleInReact.deps.react.React.createElement('div', {ref: el})
}


// To use a subcle and react props passed as they where in $.scope.xxx in a react nested into a cle (aka: cle->rect->subcle)
const UseSubCle = ({$, def, alsoSetter=false, usedProps={}, autoDestroy=false})=>{
  const [app, setApp] = CleInReact.deps.react.useState(null)
  const [oldUsedProps, setOldUsedProps] = CleInReact.deps.react.useState(null)
  const el = CleInReact.deps.react.useRef(null)

  CleInReact.deps.react.useEffect(()=>{
    _debug.log(el, app)
    // on init generate cle app, add some hook to react
    if (app === null){
      const [tag, pureDef] = Object.entries(def)[0]
      Object.entries(usedProps).forEach(([pname, pvalue]) => {
        if (alsoSetter){
          pureDef["let_"+pname] = pvalue[0]
          pureDef["def_set_"+pname] = ($, ...v)=>pvalue[1](...v)
        }
        else {
          pureDef["let_"+pname] = pvalue
          // the set should be done using react!
        }
      }); 

      // USE SUBRENDER..use the $ as parent, but a specific html element as mount point (here is the react element)
      const cleApp = $.u.newConnectedSubRenderer(el.current, {[tag]: pureDef})
      setApp(cleApp)
      _debug.log(cleApp)

      setOldUsedProps(usedProps)
    }
    // on property changes
    else {
      _debug.log("property changes!!")
      Object.entries(usedProps).forEach(([upname, upval])=>{
        if (alsoSetter){
          if (upval[0] !== oldUsedProps[upname][0]){
            app.$this.this[upname]=upval[0]
          }
        } else {
          if (upval !== oldUsedProps[upname]){
            app.$this.this[upname]=upval
          }
        }
      })

      setOldUsedProps(usedProps)
    }

    if (autoDestroy){
      return ()=>app?.destroy()
    }

  }, [def, ...(alsoSetter ? Object.values(usedProps).map(up=>up[0]) : [...Object.values(usedProps)])])

  // return <cleroot ref={el}></cleroot>
  return  CleInReact.deps.react.React.createElement(CleInReact.nestedCleTag, {ref: el})
}

export { CleInReact, UseCle, UseSubCle, UseDumbCle }
  
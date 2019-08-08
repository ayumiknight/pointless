var { useReducer, useEffect } = React;


function reducer(state, action) {
  switch (action.type) {
    case 'init':
      return action.data;
    case 'selectTag':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      // A reducer must always return a valid state.
      // Alternatively you can throw an error if an invalid action is dispatched.
      return state;
  }
}


function Terms () {
    const [state, dispatch] = useReducer(reducer, {});
    var mounted = false;
    useEffect(() => {
    	async function load() {
    		mounted = true;
    		const res = await axios.get('/terms');
    		dispatch({
    			action: 'init',
    			data: res.result
    		})
    	}
        load();
        return () => {
            mounted = false;
        };
    },[]);

    let { tags = [], categories = []} = state;
 
    	
	return <div className="panel">
		<div className="block tags">
			{tags.map( tag => {
				return <button key={tag.termId}>{key.name}</button>
			})}
		</div>
		<div className="block categories">
			{categories.map( tag => {
				return <button key={tag.termId}>{key.name}</button>
			})}
		</div>
	</div>
    
}
ReactDOM.render(<Terms/>, document.getElementById('root'))

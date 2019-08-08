var { useState, useEffect } = React;

function toggleInObj(elem, obj) {
	if (obj[elem]) {
		delete(obj[elem]);
	} else {
		obj[elem] = true;
	}
	return obj;
}

function Root() {

	return <div>
		<Form />
		<Terms />
	</div>
}

function Terms (props) {
	const [state, setState] = useState({
		tags: [],
		categories: []
	});
	var mounted = false;
	useEffect(() => {
		async function load() {
			mounted = true;
			const res = await axios.get('/terms');
			setState(res.data.result)
		}
		load();
		return () => {
			mounted = false;
		};
	},[]);

	let { tags, categories, ts = {}, cs = {}} = state,
		setts = (id) => {
			setState({
				...state,
				ts: toggleInObj(id, ts)
			})
		},
		setcs = (id) => {
			setState({
				...state,
				cs: toggleInObj(id, cs)
			})
		};

	return <div className="panel" style={{ height: '20%'}}>
		<div className="block tags">
			{tags.map( tag => {
				return <button 
					className={`${ts[tag.termId] ? 'selected' : ''}`} 
					key={tag.termId}
					onClick={() => {setts(tag.termId)}}
				>
					{tag.name}
				</button>
			})}
		</div>
		<div className="block categories">
			{categories.map( cate => {
				return <button 
					className={`${cs[cate.termId] ? 'selected' : ''}`} 
					key={cate.termId}
					onClick={() => {setcs(cate.termId)}}
				>
					{cate.name}
				</button>
			})}
		</div>
	</div>  
}

// {
//   "title": "Monumento a los ahogados - La Mano",
//   "description": "La Mano (The Hand) is a sculpture in Punta del Este by Chilean artist Mario Irarrázabal. It depicts five human fingers partially emerging from sand and is located on Parada 1 at Brava Beach, in Punta del Este, a popular resort town in Uruguay. It is also known as either Los Dedos(The Fingers), or Hombre emergiendo a la vida (Man Emerging into Life). In English but its popular name is The Hand., It has become a symbol for Punta del Este since its completion in February 1982 and in turn has become one of Uruguay's most recognizable landmarks.",
//   "panoid": "FPl4nfnkkWAFmKBQRYG_aA",
//   "lat": "-34.957816",
//   "lng": "-54.937016",
//   "pitch": "-6.1",
//   "heading": "172.02",
//   "source": "https://en.wikipedia.org/wiki/Mano_de_Punta_del_Este"
// },
function Form(props) {
	const [state, setState] = useState({
		current: {},
		parent: {},
		imgs: []
	});
	var imageInput;

	async function loadNext() {
		const res = await axios.get('/getone');
		let {title, description, panoid, lat, lng, pitch, heading } = res.data.result.current;
		

		content = `<!-- wp:paragraph -->
			<p>Location:  ${title}</p>
		<!-- /wp:paragraph -->

		<!-- wp:paragraph -->
			<p>Coordinates: &nbsp; ${lat}, ${lng}</p>
		<!-- /wp:paragraph -->
		
		<!-- wp:image {"id":1047} -->
			<figure class="wp-block-image"><img src="" alt="" class="wp-image-1047"/></figure>
		<!-- /wp:image -->

		<!-- wp:html -->
		<figure>
			<iframe src="" width="600" height="450" frameborder="0" style="border:0" allowfullscreen=""></iframe>
		</figure>
		<!-- /wp:html -->`;

		res.data.result.current.content = content;
		title = title + `at ${lat},${lng}`;

		setState(res.data.result);
		setTimeout(watchIframe, 100);
	}

	function watchIframe() {
		let iframeDomTag = document.getElementById('googleMap');
		let iframeDom = iframeDomTag.contentWindow ?  iframeDomTag.contentWindow.document : iframeDomTag.contentDocument;

		let linkwrap = iframeDom && iframeDom.getElementsByClassName("gm-iv-address-link");
		console.log(linkwrap);
		let a = linkwrap && linkwrap[0].getElementsByTagName('a');
		console.log(a);
		let finalurl = a && a[0].href;
		console.log(finalurl);
		if (!finalurl) {
			setTimeout(watchIframe, 100);
		}

	}

	async function uploadImage() {
		let file = imageInput.files[0];
		let formData = new FormData();
		formData.append("image", file);
		let res = await axios({
			url: `/upload`,
			method: 'post',
			data: formData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		let { url } = res.data.result,
			{ imgs } = state;
		
		imgs.push(url);
		console.log(imgs ,'===========imgs==========')
		setState({
			imgs
		})

	}

	let { current = {}, parent, imgs = [], currentEntryIndex, currentFileIndex} = state,
		{title, description, panoid, lat, lng, pitch, heading, content } = current;
	
	return <div className="panel">
		<div className="left">
			<div className="block">
				<button onClick={loadNext}>loadNext</button>
				{currentFileIndex},{currentEntryIndex}
			</div>
			
			<div className="block tags">
				<input value={title} onChange={(e) => setState({
					current: {
						...current,
						title: e.target.value
					}
				})} />
				<input value={description} onChange={(e) => setState({
					current: {
						...current,
						description: e.target.value
					}
				})} />
				<textarea value={content} onChange={(e) => setState({
					current: {
						...current,
						content: e.target.value
					}
				})}/>
				<div className="block">
					<input ref={(input) => { imageInput = input; }} type="file" accept="image/*" onChange={uploadImage} />
				</div>
				{imgs.map(url => {
					return <div className="block">
						{url}<img src={url} />
					</div>
				})}
			</div>
			<div className="block parent">
				{JSON.stringify(parent)}
			</div>
		</div>
		<div className='right'>
		{ panoid ? <iframe id="googleMap" src={`https://www.google.com/maps/embed/v1/streetview?pano=${panoid}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=80&key=AIzaSyArkvmDZsPzBZtuRENDx7V-EXnf4xpsdkg`} width="400"	height="300" /> : null}
		</div>
	</div>  

}

ReactDOM.render(<Root/>, document.getElementById('root'))

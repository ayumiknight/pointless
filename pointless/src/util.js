 const util = {
	locations : {
		myLocation() {
			if (navigator.geolocation) {
				let success = (position) => {
					resolve({
						lat: position.coords.latitude,
						lng: position.coords.longitude
					});
				},
					fail = (error) => {
						reject( error.code );
					};
				return new Promise(( resolve, reject) => {
					navigator.geolocation.getCurrentPosition(success, fail)
				});
			}
			return null;
		},
		commonLocations(cityName) {
			let map = {
				'newyork': {
					lat: 40.768854,
					lng: -73.976324
				}
			}
			return map[cityName.toLowerCase()];
		}
	}
}
export default util;

/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START gae_node_request_example]
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const router = require('./koa/index');
const app = new Koa();
app.use(conditional());
app.use(etag());
app.use(mount('/api' , router.routes()));

let IndexHTML = require('fs').readFileSync('./index.dev.html', 'utf8');

if (process.env.NODE_ENV === 'dev' ) {
	console.log('develop mode, starting webpack hot module replacement ... ');
	const koaWebpack = require('koa-webpack');
	const webpackConfig = require('./webpack.config.js');
	koaWebpack({
		config: webpackConfig
	}).then(middleware => {
		app.use(middleware);
		app.use((ctx, next) => {
			if (ctx.method === 'GET') {
				ctx.body = IndexHTML;
			}
		});
	});
}

app.listen(8080, () => {

});

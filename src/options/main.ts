// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { createApp } from 'vue'
import App from './Options.vue'
import { setupApp } from '~/logic/common-setup'
import '../styles'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)
app.use(vuetify)
setupApp(app)
app.mount('#app')

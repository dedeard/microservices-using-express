import './alias'
import { connect } from '@/config/connect'
import Application from '@/app'

const app = new Application()

// Run Application
app.listen()

// Connect to MongoDB
connect()

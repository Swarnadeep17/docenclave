
import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="container px-4 mx-auto">
      <section className="py-20 text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">
          Transform Your Documents with Ease
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Free online tools to manage your PDFs, images, and more
        </p>
        <Link to="/tools" className="btn-primary">
          Get Started
        </Link>
      </section>
      
      <section className="py-16">
        <h2 className="mb-8 text-3xl font-bold text-center">Popular Tools</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Tool cards will be dynamically populated here */}
        </div>
      </section>
    </div>
  )
}

export default Home

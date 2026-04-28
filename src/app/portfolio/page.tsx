import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaLinkedin, FaGithub } from 'react-icons/fa'

export default function Portfolio() {
  return (
    <main className="min-h-screen">
      <nav className="bg-secondary py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold">
              Byron Miller
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="https://www.linkedin.com/in/millerbyron/" target="_blank" className="nav-link">
                <FaLinkedin className="text-2xl" />
              </Link>
              <Link href="https://github.com/dashinja" target="_blank" className="nav-link">
                <FaGithub className="text-2xl" />
              </Link>
              <div className="flex space-x-4">
                <Link href="/" className="nav-link">About Me</Link>
                <Link href="/portfolio" className="nav-link">Portfolio</Link>
                <Link href="/auntieKimDates" className="nav-link">Auntie Kim Dates</Link>
                <Link href="/assets/documents/Byron_Miller_Resume_vc_techOnly_vari_ec_2024_03_18.docx" className="nav-link" download>
                  Resume
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Portfolio</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Project cards will go here */}
          <div className="bg-secondary rounded-lg overflow-hidden shadow-lg">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Project Name</h2>
              <p className="text-gray-300 mb-4">
                Project description goes here. This should be a brief overview of what the project does and what technologies were used.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-accent rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-accent rounded-full text-sm">Node.js</span>
                <span className="px-3 py-1 bg-accent rounded-full text-sm">MongoDB</span>
              </div>
              <div className="flex space-x-4">
                <Link href="#" className="text-accent hover:text-accent/80">
                  Live Demo
                </Link>
                <Link href="#" className="text-accent hover:text-accent/80">
                  GitHub
                </Link>
              </div>
            </div>
          </div>
          
          {/* Add more project cards as needed */}
        </div>
      </div>

      <footer className="bg-secondary py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          Copyright © {new Date().getFullYear()}
        </div>
      </footer>
    </main>
  )
} 

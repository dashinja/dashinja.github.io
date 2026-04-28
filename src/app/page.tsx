import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaLinkedin, FaGithub } from 'react-icons/fa'

export default function Home() {
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
        <div className="bg-secondary rounded-lg p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <Image
                src="/assets/images/squaremeup.png"
                alt="Byron's Headshot"
                width={300}
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold mb-4">
                The Developer Previously Known as: The Master of Electricity
              </h1>
              <div className="space-y-4">
                <p className="text-lg">
                  I graduated from Davidson College in 2009, having majored in the
                  Art and Science of being Myself. I also left with a piece of paper
                  reading 'Spanish Literature', that is, if you could read the
                  Latin.
                </p>
                <p>
                  I've been sharpening my programming axe for 3 years, beginning
                  with Ruby, transitioning to Javascript, and most recently
                  culminating in a three month intensive bootcamp focused on a full
                  stack approach to Javascript (MERN).
                </p>
                <p>
                  As if the MERN stack wasn't enough, I drank the GraphQL Kool-Aid
                  as an alternative to RESTful APIs and am cutting my teeth in that
                  wide open landscape.
                </p>
                <p>
                  I enjoy learning new technologies for real-world applications that
                  manifest as improvements to quality of life for all - whether for
                  business or personal needs. I believe design and functionality
                  should engage the user and simplify decision making.
                </p>
                <p>
                  Coding is like water. You have to drink it everyday. ... I love
                  water.
                </p>
                <p>
                  Furthermore: I have background in the entertainment industry as a
                  master electrician (theatrical), lighting department director,
                  lighting designer, lighting console programmer, and stage manager
                  as well. Understanding a client's dream, translating that into the
                  technical language of the trade, and executing on that knowledge
                  has been common place and a daily occurrence.
                </p>
                <p>
                  Getting to the heart of what a client wants and needs is in my
                  blood. Delivery flows from there.
                </p>
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-2">Technologies</h2>
                  <p>
                    MongoDb | ExpressJS | ReactJS | NodeJS | jQuery | Semantic HTML5 |
                    CSS | Vanilla JavaScript | GraphQL | Prisma ORM | MySQL | APIs
                  </p>
                </div>
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-2">In addition to coding I enjoy:</h2>
                  <ul className="list-disc list-inside">
                    <li>Learning</li>
                    <li>Thinking</li>
                    <li>Reading</li>
                    <li>Conversation</li>
                    <li>Eating</li>
                    <li>Sleeping</li>
                  </ul>
                  <p className="mt-4">
                    I also want to get back into Tennis one day soon!
                  </p>
                </div>
              </div>
            </div>
          </div>
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

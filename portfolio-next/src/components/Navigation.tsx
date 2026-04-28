import Link from 'next/link'
import { FaLinkedin, FaGithub } from 'react-icons/fa'

export default function Navigation() {
  return (
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
              <Link href="/assets/documents/Byron_Miller_Resume_vc_techOnly_vari_ec_2024_03_18.docx" className="nav-link" download>
                Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 
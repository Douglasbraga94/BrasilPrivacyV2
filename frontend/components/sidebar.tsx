"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Building2,
  Database,
  FileText,
  Home,
  MapPin,
  Shield,
  Target,
  Users,
  Clock,
  Share2,
  Eye,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  {
    name: "Mapeamento de Dados",
    icon: Database,
    children: [
      { name: "Áreas de Negócio", href: "/areas-negocio", icon: Building2 },
      { name: "Processos de Negócio", href: "/processos-negocio", icon: FileText },
      { name: "Locais de Coleta", href: "/locais-coleta", icon: MapPin },
      { name: "Finalidades", href: "/finalidades", icon: Target },
      { name: "Categoria de Titulares", href: "/categoria-titulares", icon: Users },
      { name: "Dados Pessoais", href: "/dados-pessoais", icon: Eye },
      { name: "Dados Sensíveis", href: "/dados-sensiveis", icon: Shield },
      { name: "Base Legal", href: "/base-legal", icon: Shield },
      { name: "Compartilhamento", href: "/compartilhamento", icon: Share2 },
      { name: "Retenção e Descarte", href: "/retencao-descarte", icon: Clock },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>("Mapeamento de Dados")

  return (
    <>
      {/* Backdrop overlay when expanded */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden" onClick={() => setIsExpanded(false)} />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-50",
          "bg-gradient-to-b from-slate-800 via-slate-900 to-blue-900",
          "shadow-2xl",
          isExpanded ? "w-64" : "w-16",
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          borderTopRightRadius: "24px",
          borderBottomRightRadius: "24px",
        }}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center h-20 px-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => setExpandedSection(expandedSection === item.name ? null : item.name)}
                    className={cn(
                      "w-full flex items-center px-3 py-3 text-white/80 rounded-xl hover:bg-white/10 transition-all duration-200",
                      "hover:text-white hover:shadow-lg",
                      !isExpanded && "justify-center",
                      expandedSection === item.name && "bg-white/10 text-white",
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="ml-3 whitespace-nowrap font-medium text-xs">{item.name}</span>
                        <ChevronRight
                          className={cn(
                            "ml-auto h-4 w-4 transition-transform flex-shrink-0",
                            expandedSection === item.name && "rotate-90",
                          )}
                        />
                      </>
                    )}
                  </button>
                  {isExpanded && expandedSection === item.name && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200",
                            pathname === child.href
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                              : "text-slate-300 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                          <span className="whitespace-nowrap text-xs">{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-xl transition-all duration-200",
                    pathname === item.href
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-white/80 hover:bg-white/10 hover:text-white hover:shadow-lg",
                    !isExpanded && "justify-center",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span className="ml-3 whitespace-nowrap font-medium text-xs">{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/10">
          <button
            className={cn(
              "w-full flex items-center px-3 py-3 text-white/60 rounded-xl hover:bg-white/5 hover:text-white/80 transition-all duration-200",
              !isExpanded && "justify-center",
            )}
          >
            <MoreHorizontal className="h-5 w-5 flex-shrink-0" />
            {isExpanded && <span className="ml-3 whitespace-nowrap font-medium text-xs">Mais opções</span>}
          </button>
        </div>
      </div>
    </>
  )
}

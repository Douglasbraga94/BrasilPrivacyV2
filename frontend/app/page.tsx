"use client"

import { useKeycloak } from "@/components/ClientLayout"
import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  FileText,
  Users,
  Shield,
  Database,
  MapPin,
  Target,
  Share2,
  Clock,
  UserCheck,
  Eye,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react"
import Link from "next/link"

const modules = [
  {
    id: "areas-negocio",
    title: "Áreas de Negócio",
    description: "Gerencie as áreas organizacionais da empresa",
    icon: Building2,
    count: 8,
    color: "bg-blue-500",
    href: "/areas-negocio",
  },
  {
    id: "processos-negocio",
    title: "Processos de Negócio",
    description: "Mapeie e documente os processos organizacionais",
    icon: FileText,
    count: 4,
    color: "bg-green-500",
    href: "/processos-negocio",
  },
  {
    id: "dados-pessoais",
    title: "Dados Pessoais",
    description: "Catalogue os tipos de dados pessoais tratados",
    icon: Users,
    count: 12,
    color: "bg-purple-500",
    href: "/dados-pessoais",
  },
  {
    id: "dados-sensiveis",
    title: "Dados Sensíveis",
    description: "Identifique e classifique dados sensíveis",
    icon: Shield,
    count: 5,
    color: "bg-red-500",
    href: "/dados-sensiveis",
  },
  {
    id: "base-legal",
    title: "Base Legal",
    description: "Defina as bases legais para tratamento",
    icon: Database,
    count: 7,
    color: "bg-yellow-500",
    href: "/base-legal",
  },
  {
    id: "finalidades",
    title: "Finalidades",
    description: "Especifique as finalidades do tratamento",
    icon: Target,
    count: 9,
    color: "bg-indigo-500",
    href: "/finalidades",
  },
  {
    id: "locais-coleta",
    title: "Locais de Coleta",
    description: "Mapeie onde os dados são coletados",
    icon: MapPin,
    count: 6,
    color: "bg-pink-500",
    href: "/locais-coleta",
  },
  {
    id: "compartilhamento",
    title: "Compartilhamento",
    description: "Controle o compartilhamento de dados",
    icon: Share2,
    count: 3,
    color: "bg-teal-500",
    href: "/compartilhamento",
  },
  {
    id: "retencao-descarte",
    title: "Retenção e Descarte",
    description: "Gerencie políticas de retenção",
    icon: Clock,
    count: 4,
    color: "bg-orange-500",
    href: "/retencao-descarte",
  },
  {
    id: "categoria-titulares",
    title: "Categoria de Titulares",
    description: "Classifique os titulares dos dados",
    icon: UserCheck,
    count: 8,
    color: "bg-cyan-500",
    href: "/categoria-titulares",
  },
]

const quickActions = [
  {
    title: "Novo Mapeamento",
    description: "Iniciar novo mapeamento de dados",
    icon: Plus,
    color: "bg-blue-500",
    href: "/dados-pessoais",
  },
  {
    title: "Relatório LGPD",
    description: "Gerar relatório de conformidade",
    icon: FileText,
    color: "bg-green-500",
    href: "#",
  },
  {
    title: "Auditoria",
    description: "Realizar auditoria de dados",
    icon: Eye,
    color: "bg-purple-500",
    href: "#",
  },
]

export default function Home() {
  const { authenticated, token, keycloak } = useKeycloak()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  if (!process.env.NEXT_PUBLIC_KEYCLOAK_URL || !process.env.NEXT_PUBLIC_KEYCLOAK_REALM || !process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID) {
    return <div>Configuração do Keycloak ausente. Adicione as variáveis NEXT_PUBLIC_KEYCLOAK_URL, NEXT_PUBLIC_KEYCLOAK_REALM e NEXT_PUBLIC_KEYCLOAK_CLIENT_ID no .env.local.</div>
  }

  if (!authenticated) return <div>Redirecionando para login...</div>

  const totalItems = modules.reduce((sum, module) => sum + module.count, 0)
  const activeProcesses = 4 // Número real de processos cadastrados
  const complianceScore = 85

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className={`transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard LGPD</h1>
        <p className="text-lg text-gray-600">Sistema de Gestão de Conformidade com a Lei Geral de Proteção de Dados</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total de Itens",
            value: totalItems.toString(),
            icon: Database,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            change: "+12%",
            changeColor: "text-green-600",
          },
          {
            title: "Processos Ativos",
            value: activeProcesses.toString(),
            icon: Activity,
            color: "text-green-600",
            bgColor: "bg-green-50",
            change: "+8%",
            changeColor: "text-green-600",
          },
          {
            title: "Conformidade",
            value: `${complianceScore}%`,
            icon: CheckCircle,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            change: "+5%",
            changeColor: "text-green-600",
          },
          {
            title: "Alertas",
            value: "3",
            icon: AlertTriangle,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            change: "-2",
            changeColor: "text-green-600",
          },
        ].map((stat, index) => (
          <Card
            key={stat.title}
            className={`transition-all duration-700 ease-out hover:shadow-lg ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: `${index * 150}ms`,
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className={`text-sm font-medium ${stat.changeColor}`}>{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules Section */}
      <div className="space-y-6">
        <div
          className={`transition-all duration-700 ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Módulos do Sistema</h2>
          <p className="text-gray-600">Acesse e gerencie os diferentes aspectos da conformidade LGPD</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <Link key={module.id} href={module.href}>
              <Card
                className={`cursor-pointer transition-all duration-700 ease-out hover:shadow-xl hover:scale-105 hover:-translate-y-1 group ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: `${700 + index * 100}ms`,
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${module.color} transition-transform group-hover:scale-110`}>
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      {module.count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div
          className={`transition-all duration-700 ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: `${700 + modules.length * 100 + 200}ms` }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ações Rápidas</h2>
          <p className="text-gray-600">Acesso rápido às funcionalidades mais utilizadas</p>
        </div>

        <Card
          className={`transition-all duration-700 ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: `${700 + modules.length * 100 + 400}ms` }}
        >
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link key={action.title} href={action.href}>
                  <div
                    className={`p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 cursor-pointer group ${
                      isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{
                      transitionDelay: `${700 + modules.length * 100 + 600 + index * 150}ms`,
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color} transition-transform group-hover:scale-110`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

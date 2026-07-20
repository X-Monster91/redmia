#!/usr/bin/env node
/**
 * REDMIA — Script para crear usuarios Mesa Directiva en Supabase Auth
 * Ejecutar: node scripts/crear-usuarios-admin.js
 * Requiere: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY en .env
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Datos de los 5 miembros de Mesa Directiva (ajustar con datos reales)
const mesaDirectiva = [
  {
    email: 'elena.aguirre@redmia.org',
    password: 'Redmia2026!',
    user_metadata: {
      nombre_completo: 'Dra. Elena Tzetzángary Aguirre Mejía',
      cargo: 'Dirección General',
      rol: 'mesa_directiva'
    }
  },
  {
    email: 'luz.ramirez@redmia.org',
    password: 'Redmia2026!',
    user_metadata: {
      nombre_completo: 'Dra. Luz María Ramírez Sandoval',
      cargo: 'Secretario General',
      rol: 'mesa_directiva'
    }
  },
  {
    email: 'lilia.parada@redmia.org',
    password: 'Redmia2026!',
    user_metadata: {
      nombre_completo: 'Mtra. Lilia Parada Morado',
      cargo: 'Vocal 1. Investigación',
      rol: 'mesa_directiva'
    }
  },
  {
    email: 'dafne.ramirez@redmia.org',
    password: 'Redmia2026!',
    user_metadata: {
      nombre_completo: 'Mtra. Dafne Pamela Ramírez Aguirre',
      cargo: 'Vocal 2. Vinculación',
      rol: 'mesa_directiva'
    }
  },
  {
    email: 'patricia.alvarez@redmia.org',
    password: 'Redmia2026!',
    user_metadata: {
      nombre_completo: 'Dra. Patricia Álvarez Mejía',
      cargo: 'Vocal 2 Tesorería',
      rol: 'mesa_directiva'
    }
  }
]

async function crearUsuarios() {
  console.log('🔐 Creando usuarios Mesa Directiva en Supabase Auth...\n')

  for (const miembro of mesaDirectiva) {
    try {
      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: miembro.email,
        password: miembro.password,
        email_confirm: true, // Saltar confirmación por email
        user_metadata: miembro.user_metadata
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  ${miembro.email} ya existe, actualizando metadata...`)
          
          // Buscar usuario existente
          const { data: users } = await supabase.auth.admin.listUsers()
          const existingUser = users.users.find(u => u.email === miembro.email)
          
          if (existingUser) {
            await supabase.auth.admin.updateUserById(existingUser.id, {
              user_metadata: miembro.user_metadata
            })
            console.log(`✅ Metadata actualizada para ${miembro.email}`)
          }
        } else {
          throw authError
        }
      } else {
        console.log(`✅ Usuario creado: ${miembro.email} (${miembro.user_metadata.cargo})`)
      }

      // 2. Insertar/actualizar en tabla admin_users
      const userId = authError?.message?.includes('already registered') 
        ? (await supabase.auth.admin.listUsers()).users.find(u => u.email === miembro.email)?.id
        : authData.user?.id

      if (userId) {
        const { error: adminError } = await supabase
          .from('admin_users')
          .upsert({
            auth_uid: userId,
            email: miembro.email,
            nombre_completo: miembro.user_metadata.nombre_completo,
            cargo: miembro.user_metadata.cargo,
            rol: miembro.user_metadata.rol,
            activo: true
          }, { onConflict: 'email' })

        if (adminError) {
          console.warn(`⚠️  Error en admin_users para ${miembro.email}:`, adminError.message)
        } else {
          console.log(`✅ admin_users actualizado: ${miembro.email}`)
        }
      }

    } catch (err) {
      console.error(`❌ Error con ${miembro.email}:`, err.message)
    }

    console.log('') // línea en blanco
  }

  console.log('✅ Proceso completado.')
  console.log('\n📋 Próximos pasos:')
  console.log('1. Cada integrante recibe email para establecer contraseña real')
  console.log('2. Probar login en /panel.html con cada cuenta')
  console.log('3. Verificar permisos en panel admin (aprobar/rechazar solicitudes)')
}

crearUsuarios().catch(console.error)
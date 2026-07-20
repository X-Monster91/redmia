#!/usr/bin/env node
/**
 * REDMIA — Script para crear usuarios Mesa Directiva en Supabase Auth
 * Uso: node scripts/crear-usuarios-mesa.js
 * Requiere: .env con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  console.error('Crea un archivo .env con estas variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ============================================================
// DATOS DE LOS 5 MIEMBROS DE MESA DIRECTIVA
// ============================================================
// Editar estos datos con la información real antes de ejecutar
const mesaDirectiva = [
  {
    email: 'elena.aguirre@redmia.org',
    password: 'Redmia2026!',
    nombre_completo: 'Dra. Elena Tzetzángary Aguirre Mejía',
    cargo: 'Dirección General',
    rol: 'mesa_directiva'
  },
  {
    email: 'luz.ramirez@redmia.org',
    password: 'Redmia2026!',
    nombre_completo: 'Dra. Luz María Ramírez Sandoval',
    cargo: 'Secretario General',
    rol: 'mesa_directiva'
  },
  {
    email: 'lilia.parada@redmia.org',
    password: 'Redmia2026!',
    nombre_completo: 'Mtra. Lilia Parada Morado',
    cargo: 'Vocal 1. Investigación',
    rol: 'mesa_directiva'
  },
  {
    email: 'dafne.ramirez@redmia.org',
    password: 'Redmia2026!',
    nombre_completo: 'Mtra. Dafne Pamela Ramírez Aguirre',
    cargo: 'Vocal 2. Vinculación',
    rol: 'mesa_directiva'
  },
  {
    email: 'patricia.alvarez@redmia.org',
    password: 'Redmia2026!',
    nombre_completo: 'Dra. Patricia Álvarez Mejía',
    cargo: 'Vocal 2 Tesorería',
    rol: 'mesa_directiva'
  }
]

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================
async function crearUsuariosMesaDirectiva() {
  console.log('🔐 Creando usuarios Mesa Directiva en Supabase Auth...\n')

  for (const miembro of mesaDirectiva) {
    try {
      console.log(`📧 Creando: ${miembro.nombre_completo} (${miembro.email})`)

      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: miembro.email,
        password: miembro.password,
        email_confirm: true, // Saltar confirmación por email
        user_metadata: {
          nombre_completo: miembro.nombre_completo,
          cargo: miembro.cargo,
          rol: miembro.rol
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  Ya existe: ${miembro.email}`)
        } else {
          console.error(`   ❌ Error Auth: ${authError.message}`)
          continue
        }
      } else {
        console.log(`   ✅ Usuario Auth creado: ${authData.user.id}`)
      }

      // 2. Insertar/actualizar en tabla admin_users
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          email: miembro.email,
          auth_uid: authData?.user?.id,
          nombre_completo: miembro.nombre_completo,
          cargo: miembro.cargo,
          rol: miembro.rol,
          activo: true
        }, {
          onConflict: 'email'
        })

      if (adminError) {
        console.error(`   ❌ Error admin_users: ${adminError.message}`)
      } else {
        console.log(`   ✅ Tabla admin_users actualizada`)
      }

    } catch (err) {
      console.error(`   ❌ Error inesperado: ${err.message}`)
    }

    console.log('') // línea en blanco
  }

  console.log('✅ Proceso completado')
  console.log('\n📋 Próximos pasos:')
  console.log('1. Cada integrante recibe email para establecer contraseña (si email_confirm=false)')
  console.log('2. Probar login en https://redmia.org/panel.html')
  console.log('3. Verificar que pueden ver/gestionar solicitudes en el panel')
}

crearUsuariosMesaDirectiva().catch(console.error)
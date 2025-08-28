import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!; // never expose to client

const admin = createClient(url, service);

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // 1) Create auth user (or get existing one)
    console.log('1️⃣ Creating/getting auth user...');
    let userId: string;

    try {
      const { data: userRes, error: userErr } = await admin.auth.admin.createUser({
        email: 'demo@qr.local',
        password: 'demo-password',
        email_confirm: true,
      });
      if (userErr || !userRes.user) throw userErr || new Error('Failed to create auth user');
      userId = userRes.user.id;
      console.log(`✅ Created new auth user: ${userId}`);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'email_exists') {
        // User already exists, get them by email
        const { data: users, error: listErr } = await admin.auth.admin.listUsers();
        if (listErr) throw listErr;

        const existingUser = users.users.find((u) => u.email === 'demo@qr.local');
        if (!existingUser) throw new Error('User exists but cannot be found');

        userId = existingUser.id;
        console.log(`✅ Using existing auth user: ${userId}`);
      } else {
        throw error;
      }
    }

    // 2) Mirror into public.users
    console.log('2️⃣ Creating public user profile...');
    const { error: puErr } = await admin.from('users').upsert(
      {
        id: userId,
        email: 'demo@qr.local',
        name: 'Demo User',
        avatar_url: null,
      },
      { onConflict: 'id' },
    );
    if (puErr) throw puErr;
    console.log('✅ Created/updated public user profile');

    // 3) Create organization + membership
    console.log('3️⃣ Creating organization...');

    // First try to find existing org, then create if not found
    let { data: org } = await admin.from('orgs').select('id').eq('name', 'Demo Org').single();

    if (!org) {
      // Create new org
      const { data: newOrg, error: createErr } = await admin
        .from('orgs')
        .insert({ name: 'Demo Org', plan: 'free' })
        .select('id')
        .single();
      if (createErr) throw createErr;
      org = newOrg;
      console.log(`✅ Created new organization: ${org.id}`);
    } else {
      console.log(`✅ Using existing organization: ${org.id}`);
    }

    console.log('4️⃣ Creating org membership...');

    // Check if membership already exists
    const { data: existingMember } = await admin
      .from('org_members')
      .select('org_id')
      .eq('org_id', org.id)
      .eq('user_id', userId)
      .single();

    if (!existingMember) {
      const { error: memErr } = await admin
        .from('org_members')
        .insert({ org_id: org.id, user_id: userId, role: 'owner' });
      if (memErr) throw memErr;
      console.log('✅ Created org membership');
    } else {
      console.log('✅ Org membership already exists');
    }

    // 4) Create demo QR codes for testing
    console.log('5️⃣ Creating demo QR codes...');
    const qrCodes = [
      {
        org_id: org.id,
        name: 'Hello QR',
        slug: 'hello',
        current_target_url: 'https://example.com',
        status: 'active' as const,
        created_by: userId,
      },
      {
        org_id: org.id,
        name: 'Test QR 1',
        slug: 'test-qr-1',
        current_target_url: 'https://example.com/test1',
        status: 'active' as const,
        created_by: userId,
      },
      {
        org_id: org.id,
        name: 'Test QR 2',
        slug: 'test-qr-2',
        current_target_url: 'https://example.com/test2',
        status: 'active' as const,
        created_by: userId,
      },
      {
        org_id: org.id,
        name: 'Archived QR',
        slug: 'archived-qr',
        current_target_url: 'https://example.com/archived',
        status: 'archived' as const,
        created_by: userId,
      },
    ];

    for (const qrCode of qrCodes) {
      // Check if QR code already exists
      const { data: existingQR } = await admin
        .from('qr_codes')
        .select('id')
        .eq('slug', qrCode.slug)
        .single();

      if (!existingQR) {
        const { error: qrErr } = await admin.from('qr_codes').insert(qrCode);
        if (qrErr) throw qrErr;
        console.log(`✅ Created QR code: ${qrCode.slug}`);
      } else {
        console.log(`✅ QR code already exists: ${qrCode.slug}`);
      }
    }

    console.log('\n🎉 Seed complete!');
    console.log('\n📋 Test Data Created:');
    console.log(`   👤 User: demo@qr.local / demo-password`);
    console.log(`   🏢 Organization: Demo Org`);
    console.log(`   🔗 QR Codes:`);
    console.log(`      - hello → https://example.com`);
    console.log(`      - test-qr-1 → https://example.com/test1`);
    console.log(`      - test-qr-2 → https://example.com/test2`);
    console.log(`      - archived-qr → https://example.com/archived (archived)`);
    console.log('\n🧪 You can now test the redirect function at /test-redirect');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('❌ Unexpected error:', e);
  process.exit(1);
});

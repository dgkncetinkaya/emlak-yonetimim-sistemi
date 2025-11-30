#!/usr/bin/env node

const https = require('https');

const SUPABASE_ACCESS_TOKEN = 'sbp_2a5fe03d4e072b7b8ec78b331b32c41d24b77f50';

const options = {
    hostname: 'api.supabase.com',
    path: '/v1/projects',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

console.log('🔍 Supabase projeleriniz listeleniyor...\n');

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const projects = JSON.parse(data);

            if (Array.isArray(projects)) {
                console.log(`✅ Toplam ${projects.length} proje bulundu:\n`);

                projects.forEach((project, index) => {
                    console.log(`${index + 1}. ${project.name}`);
                    console.log(`   ID: ${project.id}`);
                    console.log(`   Organization: ${project.organization_id}`);
                    console.log(`   Region: ${project.region}`);
                    console.log(`   Created: ${new Date(project.created_at).toLocaleDateString('tr-TR')}`);
                    console.log(`   Status: ${project.status || 'Active'}`);
                    console.log('');
                });
            } else {
                console.log('📋 API Yanıtı:', JSON.stringify(projects, null, 2));
            }
        } catch (error) {
            console.error('❌ JSON parse hatası:', error.message);
            console.log('Raw data:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ İstek hatası:', error.message);
});

req.end();

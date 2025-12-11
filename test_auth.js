const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    console.log('--- Testing Login (Admin) ---');
    try {
        const loginRes = await request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'admin@aflogistics.com', password: 'admin123' });
        
        console.log('Status:', loginRes.status);
        console.log('Body:', loginRes.body);

        if (loginRes.status === 200 && loginRes.body.email === 'admin@aflogistics.com') {
            console.log('✅ Login Passed');
        } else {
            console.log('❌ Login Failed');
        }
    } catch (e) { console.error('Login Error', e); }

    console.log('\n--- Testing Registration ---');
    try {
        const newEmail = `test_${Date.now()}@example.com`;
        const regRes = await request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/accounts',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            name: 'Test User',
            email: newEmail,
            password: 'password123',
            role: 'customer',
            phone: '1234567890'
        });

        console.log('Status:', regRes.status);
        console.log('Body:', regRes.body);

        if (regRes.status === 201 && regRes.body.email === newEmail) {
            console.log('✅ Registration Passed');
        } else {
            console.log('❌ Registration Failed');
        }
    } catch (e) { console.error('Registration Error', e); }
}

runTests();

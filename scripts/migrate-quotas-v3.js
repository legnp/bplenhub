/**
 * BPlen HUB — Migration Script (Quotas V3) 🧬
 * Migra créditos da coleção flat 'Member_Quotas' para o caminho hierárquico 'User/{mat}/User_Permissions/quotas'.
 * Normaliza as chaves para o padrão '1-to-1'.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Carregar variáveis de ambiente do .env.local manualmente para o script Node
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim().replace(/^"|"$/g, '');
        }
    });
}

// Inicialização segura usando variáveis de ambiente do Next.js/Firebase
if (admin.apps.length === 0) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            })
        });
    } catch (e) {
        // Fallback para ADC (Application Default Credentials)
        admin.initializeApp();
    }
}

const db = admin.firestore();

async function migrate() {
    console.log("🚀 Iniciando migração de cotas para V3...");
    
    const oldCollection = db.collection('Member_Quotas');
    const snapshot = await oldCollection.get();
    
    if (snapshot.empty) {
        console.log("ℹ️ Nenhuma cota encontrada na coleção antiga.");
        return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const doc of snapshot.docs) {
        const uid = doc.id;
        const data = doc.data();
        
        try {
            // 1. Resolver Matrícula
            const mapSnap = await db.collection('_AuthMap').doc(uid).get();
            if (!mapSnap.exists) {
                console.warn(`⚠️ [UID: ${uid}] Matrícula não encontrada no _AuthMap. Pulando...`);
                failCount++;
                continue;
            }

            const matricula = mapSnap.data().matricula;
            
            // 2. Preparar Novos Dados (Normalização)
            let quotas = data.quotas || {};
            if (quotas['mentoria_1to1']) {
                quotas['1-to-1'] = quotas['mentoria_1to1'];
                delete quotas['mentoria_1to1'];
            }

            // 3. Salvar no Novo Local
            const newPath = `User/${matricula}/User_Permissions/quotas`;
            await db.doc(newPath).set({
                uid: uid,
                quotas: quotas,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`✅ [OK] Migrado: ${uid} -> ${matricula} no path: ${newPath}`);
            successCount++;

        } catch (err) {
            console.error(`❌ [ERRO] Falha ao migrar UID ${uid}:`, err.message);
            failCount++;
        }
    }

    console.log("\n--- Resumo da Migração ---");
    console.log(`Sucessos: ${successCount}`);
    console.log(`Falhas: ${failCount}`);
    console.log("--------------------------");
}

migrate()
    .then(() => {
        console.log("✨ Processo concluído.");
        process.exit(0);
    })
    .catch(err => {
        console.error("💥 Erro crítico no script:", err);
        process.exit(1);
    });

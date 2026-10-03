import { api } from './api.ts' // Upewnij się, że ścieżka się zgadza

async function runTest() {
	console.log('🚀 START TESTU KLIENTA API...')
	try {
		// 1. Czyszczenie środowiska
		await api.resetDemo()
		console.log('✅ Baza zresetowana')

		// 2. Utworzenie sprawy przez aplikację (rola B)
		const newCase = await api.createCase('app')
		console.log(`✅ Sprawa utworzona: ${newCase.case_id} (Klucz: ${newCase.case_key})`)

		// 3. Sprawdzenie statusu klienta (rola B)
		const status = await api.getCaseStatus(newCase.case_id, newCase.case_key)
		console.log(`✅ Status w bazie: ${status.status} (Wygasa: ${status.expires_at})`)

		// 4. Szpital przyjmuje sprawę (rola C)
		const admit = await api.admitCase(newCase.case_id, 'ST-A41', 'H-DEMO')
		console.log(`✅ Szpital przyjął: sekwencja wpisu w dzienniku #${admit.entry_seq}`)

		console.log('🎉 Klient API działa perfekcyjnie!')
	} catch (error: any) {
		console.error('❌ BŁĄD:', error.message || error)
	}
}

runTest()

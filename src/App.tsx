/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Atualização Concluída!</h1>
        <p className="text-gray-600 mb-6">
          O código do seu aplicativo foi atualizado para suportar notificações push nativas de forma <strong>100% gratuita</strong> e sem necessidade de servidor (backend).
        </p>
        <div className="mt-8 text-left text-sm text-gray-500">
          <h2 className="font-semibold text-gray-700 mb-2">Como baixar e atualizar seu GitHub:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>No menu superior direito do AI Studio (ícone de engrenagem/configurações), clique em <strong>"Export to ZIP"</strong> ou <strong>"Export to GitHub"</strong>.</li>
            <li>Se baixar o ZIP, extraia os arquivos e substitua os do seu repositório original.</li>
            <li>Faça o commit e push para o GitHub.</li>
            <li><strong>Pronto!</strong> Não é necessário usar terminal ou pagar planos do Firebase.</li>
          </ol>
          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-xs">
            <strong>Nota sobre Notificações:</strong> Como removemos o servidor pago, as notificações nativas funcionarão perfeitamente <strong>enquanto o app estiver aberto</strong> (mesmo que em segundo plano ou minimizado no celular). O navegador cuidará de exibir o alerta nativo no momento certo!
          </div>
        </div>
      </div>
    </div>
  );
}

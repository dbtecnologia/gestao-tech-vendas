"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page-error"><div className="error-mark">!</div><span className="eyebrow">TEMPO</span><h1>Não foi possível carregar esta tela</h1><p>Ocorreu uma falha temporária. Tente novamente ou volte para o início.</p><div className="error-actions"><button className="primary" onClick={() => reset()}>Tentar novamente</button><button className="secondary" onClick={() => { window.location.href = "/"; }}>Voltar ao início</button></div></main>;
}

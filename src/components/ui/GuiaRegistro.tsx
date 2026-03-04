'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';

const STORAGE_KEY = 'tacticalpadel-guia-collapsed';

const PASOS = [
  {
    num: 1,
    titulo: 'Selecciona quien golpea',
    desc: 'Elige el jugador (J1-J4) que ejecuta el golpe.',
    icono: '👤',
  },
  {
    num: 2,
    titulo: 'Elige el tipo de golpe',
    desc: 'S=Saque, V=Volea, B=Bandeja, Rm=Remate, G=Globo, D=Dejada, etc.',
    icono: '🎾',
  },
  {
    num: 3,
    titulo: 'Toca la zona de la cancha',
    desc: 'Selecciona en el mapa donde cayo la pelota (zonas 1-12).',
    icono: '📍',
  },
  {
    num: 4,
    titulo: 'Ajusta modificadores',
    desc: 'Direccion (cruzado/paralelo), potencia y efecto. Opcional.',
    icono: '⚙️',
  },
  {
    num: 5,
    titulo: 'Define el resultado',
    desc: 'W=Winner, X=Error, N=No llega, DF=Doble falta, o continua el punto.',
    icono: '✅',
  },
];

export function GuiaRegistro() {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === 'true');
    } else {
      setCollapsed(false); // Show by default for new users
    }
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <Card className="relative">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-sm font-semibold">
          {collapsed ? '📖 Mostrar guia de registro' : '📖 Guia de registro'}
        </span>
        <span className="text-xs text-muted">
          {collapsed ? '▼' : '▲'}
        </span>
      </button>

      {!collapsed && (
        <div className="mt-3 space-y-3">
          {/* Steps */}
          <div className="space-y-2">
            {PASOS.map((paso) => (
              <div key={paso.num} className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">{paso.icono}</span>
                <div>
                  <span className="text-xs font-bold text-primary">Paso {paso.num}:</span>{' '}
                  <span className="text-xs font-semibold">{paso.titulo}</span>
                  <p className="text-[11px] text-muted leading-tight">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick example */}
          <div className="bg-background rounded-md p-2 border border-border">
            <p className="text-[11px] text-muted mb-1 font-semibold">Ejemplo de notacion:</p>
            <p className="text-xs font-mono">
              <span className="text-primary">J1</span>:
              <span className="text-yellow-500">S</span>
              <span className="text-accent">+</span>→
              <span className="text-secondary">8</span>
              {' = '}
              <span className="text-muted">Juan saca fuerte a zona 8</span>
            </p>
          </div>

          {/* Shot codes reference */}
          <div>
            <p className="text-[11px] text-muted font-semibold mb-1">Codigos de golpe:</p>
            <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-[11px]">
              <span><span className="font-mono font-bold text-yellow-500">S</span> Saque</span>
              <span><span className="font-mono font-bold text-green-500">V</span> Volea</span>
              <span><span className="font-mono font-bold text-red-500">B</span> Bandeja</span>
              <span><span className="font-mono font-bold text-red-500">Rm</span> Remate</span>
              <span><span className="font-mono font-bold text-blue-500">G</span> Globo</span>
              <span><span className="font-mono font-bold text-green-500">D</span> Dejada</span>
              <span><span className="font-mono font-bold text-green-500">Ch</span> Chiquita</span>
              <span><span className="font-mono font-bold text-red-500">Ps</span> Passing</span>
              <span><span className="font-mono font-bold text-purple-500">BP</span> Baj. Pared</span>
            </div>
          </div>

          {/* Status reference */}
          <div>
            <p className="text-[11px] text-muted font-semibold mb-1">Resultado del golpe:</p>
            <div className="flex gap-3 text-[11px]">
              <span><span className="font-mono font-bold text-primary">W</span> Winner</span>
              <span><span className="font-mono font-bold text-danger">X</span> Error</span>
              <span><span className="font-mono font-bold text-accent">N</span> No llega</span>
              <span><span className="font-mono font-bold text-danger">DF</span> Doble falta</span>
            </div>
          </div>

          <button
            onClick={toggle}
            className="w-full text-center text-xs text-muted hover:text-foreground transition-colors py-1"
          >
            Entendido, ocultar guia
          </button>
        </div>
      )}
    </Card>
  );
}

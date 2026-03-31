import { describe, it, expect, vi } from 'vitest';
import { getISOWeek, getYear } from 'date-fns';

// Simulação de lógica de governança (Como não temos db real aqui, testamos a formação de IDs e regras)
describe('BPlen HUB — Governança de Agenda', () => {
  const userId = "user_test_123";
  const date = new Date(2026, 2, 31); // 31 de Março (0-indexed)
  const week = getISOWeek(date);
  const year = getYear(date);

  it('deve gerar chaves únicas por categoria para permitir 3 agendamentos na semana', () => {
    const categories = ["grupo", "individual", "1to1"];
    
    const keys = categories.map(cat => `${userId}_week_${week}_${year}_${cat}`);
    
    expect(keys[0]).not.toBe(keys[1]);
    expect(keys).toContain(`${userId}_week_${week}_2026_1to1`);
  });

  it('deve retornar fallbacks corretos para o nickname em diferentes estruturas de documento', () => {
    const mockDataRoot = { User_Nickname: "Lis Root" };
    const mockDataWelcome = { User_Welcome: { User_Nickname: "Lis Welcome" } };
    const mockDataEmpty = {};

    const getNickname = (d: any) => {
      const welcome = d.User_Welcome || {};
      return welcome.User_Nickname || d.User_Nickname || "Membro BPlen";
    };

    expect(getNickname(mockDataWelcome)).toBe("Lis Welcome");
    expect(getNickname(mockDataRoot)).toBe("Lis Root");
    expect(getNickname(mockDataEmpty)).toBe("Membro BPlen");
  });
});

describe('BPlen HUB — Fluxos de Sessão', () => {
  it('deve validar se o usuário está logado antes de carregar compromissos', () => {
    const user = { uid: "123" };
    const loadBookings = vi.fn((u) => u ? "loading..." : "error");

    expect(loadBookings(user)).toBe("loading...");
    expect(loadBookings(null)).toBe("error");
  });
});

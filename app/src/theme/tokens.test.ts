import { colors } from './tokens';

describe('tokens', () => {
  it('uses the Vasko brand colours', () => {
    expect(colors.navy).toBe('#1F2E4A');
    expect(colors.cognac).toBe('#8B5E3C');
    expect(colors.cream).toBe('#F6F1E8');
    expect(colors.creamLight).toBe('#FFFDF8');
  });
});

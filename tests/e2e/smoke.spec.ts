import {test,expect} from '@playwright/test';

test('catalog, product switch and panic control render',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await expect(page.getByRole('heading',{name:'Shepard Circular Pitch'})).toBeVisible();
  await page.getByRole('button',{name:'Infinite Motion'}).click();
  await expect(page.getByRole('heading',{name:'Infinite Motion'})).toBeVisible();
  await expect(page.getByRole('button',{name:'PANIC STOP'})).toBeVisible();
});

test('Phantom Words shows listening instructions, specific reports and lab token controls',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await page.getByRole('button',{name:'Phantom Words'}).click();
  await expect(page.getByRole('heading',{name:'How to listen'})).toBeVisible();
  await expect(page.getByText(/Headphones can demonstrate/i)).toBeVisible();
  await expect(page.getByLabel('Left-side words or phrases')).toBeVisible();
  await expect(page.getByLabel('Right-side words or phrases')).toBeVisible();
  await expect(page.getByLabel('Center words or phrases')).toBeVisible();
  await page.getByRole('button',{name:'LAB',exact:true}).click();
  await expect(page.getByLabel('Token A audio')).toBeVisible();
  await expect(page.getByLabel('Token B audio')).toBeVisible();
  await expect(page.getByRole('button',{name:'Record token A'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Record token B'})).toBeVisible();
});

test('Phantom Words built-in classic speech starts and stops through the audio engine',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await page.getByRole('button',{name:'Phantom Words'}).click();
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Playing');
  await page.getByRole('button',{name:'Stop',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Stopped');
});

test('Glissando shows speaker guidance and starts/stops the corrected stimulus',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await page.getByRole('button',{name:'Glissando Illusion'}).click();
  await expect(page.getByRole('heading',{name:'How to listen'})).toBeVisible();
  await expect(page.getByText(/two separated stereo loudspeakers/i)).toBeVisible();
  await expect(page.getByText(/Headphones can reproduce/i)).toBeVisible();
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Playing');
  await page.waitForTimeout(600);
  await page.getByRole('button',{name:'Stop',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Stopped');
});

test('Zwicker exposes the induction/silence workflow, lab controls and perception report',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await page.getByRole('button',{name:'Zwicker Phantom Tone'}).click();
  await expect(page.getByRole('heading',{name:'How to listen'})).toBeVisible();
  await expect(page.getByText(/five seconds of notched broadband noise/i)).toBeVisible();
  await expect(page.getByLabel('Zwicker estimated pitch (Hz)')).toBeVisible();
  await expect(page.getByRole('button',{name:'Heard a phantom tone'})).toBeVisible();
  await expect(page.getByRole('button',{name:'No clear phantom tone'})).toBeVisible();

  await page.getByRole('button',{name:'LAB',exact:true}).click();
  await expect(page.getByLabel('Notch center (Hz)')).toBeVisible();
  await expect(page.getByLabel('Notch width (octaves)')).toBeVisible();
  await page.getByLabel('Noise duration (seconds)').fill('0.35');
  await page.getByLabel('Silent listening window (seconds)').fill('0.5');
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Notched noise playing');
  await page.waitForTimeout(500);
  await expect(page.locator('.status')).toContainText('Listen now: digital silence');
  await page.waitForTimeout(500);
  await expect(page.locator('.status')).toContainText('Trial complete');
});

test('Missing Fundamental separates the absent f0 from generated harmonics and records perceived pitch',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await page.getByRole('button',{name:'Missing Fundamental'}).click();
  await expect(page.getByRole('heading',{name:'How to listen'})).toBeVisible();
  await expect(page.getByText(/The Missing Fundamental illusion demonstrates virtual pitch/i)).toBeVisible();
  await expect(page.getByText(/Missing f0: 110 Hz/i)).toBeVisible();
  await expect(page.getByLabel('Missing Fundamental perceived pitch (Hz)')).toBeVisible();
  await expect(page.getByRole('button',{name:'Save perceived pitch'})).toBeVisible();

  await page.getByRole('button',{name:'LAB',exact:true}).click();
  await expect(page.getByLabel('Fundamental reference (Hz)')).toBeVisible();
  await expect(page.getByLabel('First generated harmonic')).toBeVisible();
  await expect(page.getByLabel('Last generated harmonic')).toBeVisible();
  await expect(page.getByLabel('Amplitude rolloff (dB/octave)')).toBeVisible();
  await expect(page.getByLabel('Phase mode')).toBeVisible();

  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Playing');
  await page.getByRole('button',{name:'Stop',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Stopped');
});

test('Combination Tone Explorer keeps predicted products separate from generated primaries',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await page.getByRole('button',{name:'Combination Tone Explorer'}).click();
  await expect(page.getByRole('heading',{name:'How to listen'})).toBeVisible();
  await expect(page.getByText(/not intentionally present/i)).toBeVisible();
  await expect(page.getByText(/Difference: 200.0 Hz/)).toBeVisible();
  await expect(page.getByText(/2f1−f2: 500.0 Hz/)).toBeVisible();
  await expect(page.getByText(/2f2−f1: 1100.0 Hz/)).toBeVisible();
  await expect(page.getByLabel('Combination tone perceived pitch (Hz)')).toBeVisible();

  await page.getByRole('button',{name:'LAB',exact:true}).click();
  await expect(page.getByLabel('Primary f1 (Hz)')).toBeVisible();
  await expect(page.getByLabel('Primary f2 (Hz)')).toBeVisible();
  await expect(page.getByLabel('Primary level')).toBeVisible();
  await expect(page.getByLabel('Primary balance')).toBeVisible();
  await expect(page.getByLabel('Waveform')).toBeVisible();

  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Playing');
  await page.getByRole('button',{name:'Stop',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Stopped');
});

test('Precedence / Haas uses discrete lead-lag transients and experiment-specific reporting',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await page.getByRole('button',{name:'Precedence / Haas Explorer'}).click();
  await expect(page.getByRole('heading',{name:'How to listen'})).toBeVisible();
  await expect(page.getByText(/stereo speakers/i)).toBeVisible();
  await expect(page.getByRole('button',{name:'One fused sound'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Two distinct sounds'})).toBeVisible();
  await expect(page.getByLabel('Precedence perceived location')).toBeVisible();

  await page.getByRole('button',{name:'LAB',exact:true}).click();
  await expect(page.getByLabel('Lead-lag delay (ms)')).toBeVisible();
  await expect(page.getByLabel('Lead side')).toBeVisible();
  await expect(page.getByLabel('Source type')).toBeVisible();
  await expect(page.getByLabel('Transient duration (ms)')).toBeVisible();
  await expect(page.getByLabel('Repetition interval (ms)')).toBeVisible();
  await expect(page.getByLabel('Lead-vs-lag level difference (dB)')).toBeVisible();

  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Playing');
  await page.waitForTimeout(100);
  await page.getByRole('button',{name:'Stop',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Stopped');
});

const rebuilt:[string,string][]=[
  ['Shepard Circular Pitch','Rising endlessly'],
  ['Shepard–Risset Glide','Rising endlessly'],
  ['Risset Rhythm','Accelerating endlessly'],
  ['Octave Illusion','Save perception report'],
  ['Scale Illusion','Save perception report'],
  ['Chromatic Illusion','Save perception report'],
  ['Cambiata Illusion','Save perception report'],
  ['Auditory Stream Segregation','Two streams'],
  ['Continuity / Filling-in','Continuous through the gap'],
  ['Mysterious Melody','Recognized'],
];
for(const [name,response] of rebuilt){
  test(`${name} starts, shows its own response UI and stops`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/Auditory-Illusion-Laboratory/');
    await page.getByRole('button',{name,exact:true}).click();
    await expect(page.getByRole('heading',{name:'How to listen'})).toBeVisible();
    await expect(page.getByRole('button',{name:response,exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Rising',exact:true})).toHaveCount(0);
    await page.getByRole('button',{name:'LAB',exact:true}).click();
    await page.getByRole('button',{name:'Start',exact:true}).click();
    await expect(page.locator('.status')).toContainText('Playing');
    await page.waitForTimeout(400);
    await page.getByRole('button',{name:'Stop',exact:true}).click();
    await expect(page.locator('.status')).toContainText('Stopped');
    expect(errors).toEqual([]);
  });
}

test('Tritone mapper records a judgment keyed to pitch class and advances',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await page.getByRole('button',{name:'Tritone Paradox Mapper'}).click();
  await expect(page.getByText(/Trial 1 of 12/)).toBeVisible();
  await page.getByRole('button',{name:'Play pair'}).click();
  await page.getByRole('button',{name:/^Up/}).click();
  await expect(page.getByText(/Trial 2 of 12/)).toBeVisible();
  await expect(page.getByLabel('Tritone paradox response map')).toContainText('↑1');
});

test('Speech-to-Song asks for a recording before Start',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await page.getByRole('button',{name:'Speech-to-Song'}).click();
  await expect(page.getByRole('button',{name:'Record short phrase'})).toBeVisible();
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.locator('.status')).toContainText('Record a short phrase first');
});

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

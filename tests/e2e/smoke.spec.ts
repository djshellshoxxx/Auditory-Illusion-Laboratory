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
  await page.getByRole('button',{name:'LAB'}).click();
  await expect(page.getByLabel('Token A audio')).toBeVisible();
  await expect(page.getByLabel('Token B audio')).toBeVisible();
  await expect(page.getByRole('button',{name:'Record token A'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Record token B'})).toBeVisible();
});

test('Phantom Words built-in classic speech starts and stops through the audio engine',async({page})=>{
  await page.goto('/Auditory-Illusion-Laboratory/');
  await page.getByRole('button',{name:'Phantom Words'}).click();
  await page.getByRole('button',{name:'Start'}).click();
  await expect(page.locator('.status')).toContainText('Playing');
  await page.getByRole('button',{name:'Stop'}).click();
  await expect(page.locator('.status')).toContainText('Stopped');
});

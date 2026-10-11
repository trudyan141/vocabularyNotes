import {test,expect} from '@playwright/test';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
test.beforeEach(async({page})=>{
 await page.route('**/api/auth/status*',route=>route.fulfill({json:{configured:false,user:null}}));
 await page.route(/^https:\/\//,route=>route.abort());await page.addInitScript(()=>localStorage.setItem('wfk-parent-ai-disabled-v1','1'));await page.route('**/api/dictionary?mode=suggest&**',route=>route.fulfill({json:{results:[]}}));
});
test('manual save has no checkbox; two tabs show compact grammar rows with a full detail page',async({page},info)=>{
 await page.goto('/add');await page.getByRole('combobox').fill('nu');await page.getByRole('option').filter({hasText:'nut'}).getByRole('button').click();
 await expect(page.getByRole('checkbox',{name:'Tôi đã kiểm tra nội dung và đồng ý cho con học'})).toHaveCount(0);await expect(page.getByRole('link',{name:'Xem thư viện'})).toHaveCount(0);
 await page.getByRole('button',{name:'Lưu từ',exact:true}).click();await expect(page).toHaveURL(/\/library\/words\//);
 await expect(page.getByText('The nut has a hard shell.',{exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Mẫu câu',exact:true})).toHaveCount(0);
 await page.goto('/library/words/apple/edit');await page.getByLabel('Câu ví dụ thứ hai',{exact:true}).fill('It is an apple.');await page.getByLabel('Nghĩa câu ví dụ thứ hai',{exact:true}).fill('Đó là quả táo.');await page.getByText('Ngữ pháp và mẫu câu',{exact:true}).click();await page.getByLabel('Câu ví dụ',{exact:true}).fill('It is an apple.');await page.locator('#word-edit-extra-exampleVi').fill('Đó là quả táo.');await page.getByLabel('Mẫu câu',{exact:true}).fill('It is + noun.');await page.getByLabel('Giải thích mẫu câu',{exact:true}).fill('Dùng để gọi tên.');await page.getByRole('button',{name:'Lưu chỉnh sửa',exact:true}).click();await expect(page.getByRole('button',{name:'Đã lưu chỉnh sửa',exact:true})).toBeVisible();
 await page.goto('/library');await page.getByRole('button',{name:'Ngữ pháp',exact:true}).click();await page.getByRole('searchbox').fill('It is + noun');
 await expect(page.locator('.learning-summary')).toHaveCount(1);await expect(page.locator('.learning-summary')).toContainText('It is an apple.');await expect(page.getByText('Dùng để gọi tên.',{exact:true})).toHaveCount(0);
 await page.locator('.learning-summary').click();await expect(page).toHaveURL(/\/library\/grammar\//);await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByText('Dùng để gọi tên.',{exact:true}).first()).toBeVisible();await page.screenshot({path:info.outputPath('lesson-detail.png')});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('link',{name:'Quay lại',exact:true}).click();await expect(page.locator('.content-modes button')).toHaveCount(2);await expect(page.getByRole('button',{name:'Câu',exact:true})).toHaveCount(0);await page.screenshot({path:info.outputPath('two-tabs.png')});
});
test('missing-word picture search imports and saves a selected image, with retry on failure',async({page})=>{
 await page.goto('/library/words/apple/edit');await page.getByText('Đổi hình',{exact:true}).click();await page.getByRole('button',{name:'Bỏ hình',exact:true}).click();await page.getByRole('button',{name:'Lưu chỉnh sửa',exact:true}).click();await expect(page.getByRole('button',{name:'Đã lưu chỉnh sửa',exact:true})).toBeVisible();await page.getByRole('link',{name:'Quay lại',exact:true}).click();await expect(page).toHaveURL(/\/library\/words\/apple$/);
 await page.goto('/library/prepare');await expect(page.getByRole('strong').filter({hasText:/^apple$/})).toBeVisible();await expect(page.getByText('Chọn hình có sẵn',{exact:true})).toHaveCount(0);
 await page.route('**/api/media/search',route=>route.fulfill({status:503,json:{error:'unavailable'}}));await page.getByRole('button',{name:'Tìm hình',exact:true}).first().click();await expect(page.locator('.word-picture-search [role=alert]')).toContainText('Chưa tải được hình');
 const bytes=await sharp({create:{width:32,height:32,channels:3,background:'#ee5588'}}).jpeg().toBuffer();const candidate={id:`1:${'a'.repeat(40)}`,title:'File:Apple drawing.png',sourceUrl:'https://commons.wikimedia.org/wiki/File:Apple_drawing.png',imageUrl:'https://upload.wikimedia.org/example.png',creator:'Fixture artist',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',credit:'Fixture artist CC0'};
 await page.route('**/api/media/search',route=>route.fulfill({json:{candidates:[candidate]}}));await page.route('**/api/media/import',route=>route.fulfill({json:{candidate,base64:bytes.toString('base64'),sha256:createHash('sha256').update(bytes).digest('hex'),checkedAt:new Date().toISOString(),receipt:'fixture-no-live-receipt'}}));
 await page.getByRole('button',{name:'Tìm hình',exact:true}).first().click();await page.getByRole('button',{name:/Dùng hình cho apple/}).click();await expect(page.getByRole('strong').filter({hasText:/^apple$/})).toHaveCount(0);
 await page.goto('/library/words/apple');await expect(page.locator('.word-detail-hero img').first()).toHaveAttribute('src',/^data:image\/jpeg;base64,/);await page.reload();await expect(page.locator('.word-detail-hero img').first()).toHaveAttribute('src',/^data:image\/jpeg;base64,/);
});

test('selected remote spelling updates input and Gemini fills two examples without optional controls',async({page})=>{
 await page.addInitScript(()=>{localStorage.removeItem('wfk-parent-ai-disabled-v1');localStorage.setItem('wfk-parent-ai-v1',JSON.stringify({key:'AIza-fixture-word-examples-only-123',model:'gemini-3.5-flash-lite'}));});
 await page.route('**/api/dictionary?mode=suggest&**',route=>route.fulfill({json:{results:[{word:'intense'}]}}));
 await page.route('**/api/dictionary?word=intense',route=>route.fulfill({json:{results:[{word:'intense',pos:'adjective',sense:'very strong',vi:'mãnh liệt',definition:'Very strong.',ipa:'/ɪnˈtens/',source:'Fixture dictionary',examples:[]}]}}));
 await page.route('https://generativelanguage.googleapis.com/**',route=>route.fulfill({json:{candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({word:'intense',pos:'adjective',sense:'very strong',vi:'mãnh liệt',en:'Very strong.',examples:[{text:'The heat is intense.',vi:'Sức nóng rất mạnh.',ipa:'/ðə hiːt ɪz ɪnˈtens/',hint:'Đờ hít iz in-tens'},{text:'The light is intense.',vi:'Ánh sáng rất mạnh.',ipa:'/ðə laɪt ɪz ɪnˈtens/',hint:'Đờ lai-t iz in-tens'}]})}]}}]}}));
 await page.goto('/add');await page.getByRole('combobox').fill('intens');await page.getByRole('option').filter({hasText:'intense'}).getByRole('button').click();await expect(page.getByRole('combobox')).toHaveValue('intense');
 await expect(page.getByLabel('Câu ví dụ thứ hai',{exact:true})).toHaveValue('The light is intense.');await expect(page.getByLabel('IPA cả câu ví dụ thứ hai',{exact:true})).toHaveValue('/ðə laɪt ɪz ɪnˈtens/');await expect(page.getByText('Ví dụ thứ hai và cách đọc câu (tùy chọn)',{exact:true})).toHaveCount(0);
 await page.goto('/library');await expect(page.getByRole('radio',{name:'Tất cả',exact:true})).toBeVisible();await page.getByRole('radio',{name:'Chưa có hình',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
});

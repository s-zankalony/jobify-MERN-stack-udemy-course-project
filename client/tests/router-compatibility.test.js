import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryRouter, redirect } from 'react-router-dom';

// Exercise the nested data-router APIs used by App.jsx without a live backend.
test('nested routes preserve loader filters, form actions, redirects, and back navigation', async () => {
  const calls = [];
  const router = createMemoryRouter([
    { path: '/', children: [
      { index: true },
      { path: 'login', action: async ({ request }) => {
        calls.push(Object.fromEntries(await request.formData()));
        return redirect('/dashboard');
      } },
      { path: 'dashboard', loader: () => ({ user: { name: 'Test' } }), children: [
        { index: true },
        { path: 'all-jobs', loader: ({ request }) => Object.fromEntries(new URL(request.url).searchParams) },
        { path: 'edit-job/:id', loader: ({ params }) => ({ id: params.id }) },
        { path: 'profile', action: async ({ request }) => ({ name: (await request.formData()).get('name') }) },
      ] },
    ] },
  ], { initialEntries: ['/'] });
  try {
    const formData = new FormData();
    formData.set('email', 'test@example.invalid');
    await router.navigate('/login', { formMethod: 'post', formData });
    assert.equal(router.state.location.pathname, '/dashboard');
    assert.equal(calls[0].email, 'test@example.invalid');
    await router.navigate('/dashboard/all-jobs?search=engineer&page=2');
    assert.deepEqual(Object.values(router.state.loaderData).find(v => v.search), { search: 'engineer', page: '2' });
    await router.navigate('/dashboard/edit-job/123');
    assert.equal(Object.values(router.state.loaderData).find(v => v.id)?.id, '123');
    const profile = new FormData(); profile.set('name', 'Updated');
    await router.navigate('/dashboard/profile', { formMethod: 'post', formData: profile });
    assert.equal(Object.values(router.state.actionData)[0].name, 'Updated');
    await router.navigate('/dashboard/all-jobs');
    await router.navigate(-1);
    // POP navigation is asynchronous; wait for the router to return to idle.
    if (router.state.navigation.state !== 'idle') await new Promise(resolve => {
      const unsubscribe = router.subscribe(state => { if (state.navigation.state === 'idle') { unsubscribe(); resolve(); } });
    });
    assert.equal(router.state.location.pathname, '/dashboard/profile');
    assert.equal(router.state.errors, null);
  } finally { router.dispose(); }
});

test('loader authentication redirects still work', async () => {
  const router = createMemoryRouter([{ path: '/' }, { path: '/dashboard', loader: () => redirect('/') }]);
  try { await router.navigate('/dashboard'); assert.equal(router.state.location.pathname, '/'); }
  finally { router.dispose(); }
});

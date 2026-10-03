const [{ isAuthorMode }, { default: gtmMartech }] = await Promise.all([
    import('./martech-config.js'),
    import('/core/scripts/gtm-martech.js'),
]);

export const eventDataSuccess = (status, consultType) => {
    if (!isAuthorMode()) {
        gtmMartech.pushToDataLayer({
            event: "consult_AviancaCredits",
            funnel_category: "refunds",
            page_location: window.location.href,
            page_referrer: document.referrer || 'direct',
            language: navigator.language,
            screen_resolution: `${screen.width}x${screen.height}`,
            user_type: "Guest",
            status_voucher: status || 'Voucher Not found',
            consult_type: consultType || 'Not found',
        });
    }
}

export const eventDataError = (desc, id) => {
    if (!isAuthorMode()) {
        gtmMartech.pushToDataLayer({
            event: "error",
            ecommerce: {
                page_location: window.location.href,
                page_referrer: document.referrer || 'direct',
                page_title: document.title,
                page_name: document.title,
                language: navigator.language,
                screen_resolution: `${screen.width}x${screen.height}`,
                user_type: "Guest",
                user_id: "NA",
                error_pnr: "NA",
                error_desc: desc,
                error_id: id,
                funnel_category: "refunds",
            }
        });
    }
}
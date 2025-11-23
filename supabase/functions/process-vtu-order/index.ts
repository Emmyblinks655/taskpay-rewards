import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderRequest {
  service_id: string;
  target: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { service_id, target }: OrderRequest = await req.json();

    // Get service details
    const { data: service, error: serviceError } = await supabaseClient
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single();

    if (serviceError || !service) {
      throw new Error('Service not found');
    }

    // Get user profile with balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('balance, is_agent, agent_rate_multiplier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    // Calculate cost (apply agent discount if applicable)
    const basePrice = service.sale_price || service.price;
    const cost = profile.is_agent 
      ? basePrice * (profile.agent_rate_multiplier || 1.0)
      : basePrice;

    // Check balance
    if (profile.balance < cost) {
      throw new Error('Insufficient balance');
    }

    // Deduct from wallet
    const newBalance = profile.balance - cost;
    const { error: balanceError } = await supabaseClient
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id);

    if (balanceError) {
      throw new Error('Failed to deduct balance');
    }

    // Log wallet transaction
    await supabaseClient
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'debit',
        amount: cost,
        balance_before: profile.balance,
        balance_after: newBalance,
        description: `Purchase: ${service.name}`,
      });

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        service_id: service.id,
        amount: service.price,
        cost: cost,
        target: target,
        status: 'processing',
      })
      .select()
      .single();

    if (orderError || !order) {
      // Refund on error
      await supabaseClient
        .from('profiles')
        .update({ balance: profile.balance })
        .eq('id', user.id);
      throw new Error('Failed to create order');
    }

    // Process with provider (with retry logic)
    let lastError = '';
    let success = false;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Get enabled providers ordered by priority
        const { data: providers } = await supabaseClient
          .from('providers')
          .select('*')
          .eq('enabled', true)
          .order('priority', { ascending: false });

        if (!providers || providers.length === 0) {
          throw new Error('No providers available');
        }

        const provider = providers[0];
        
        // Mock provider call (replace with actual API call)
        console.log(`Attempting order with ${provider.name}, attempt ${attempt + 1}`);
        
        const providerResponse = await callProvider(provider, service, target);
        
        // Log provider call
        await supabaseClient
          .from('provider_logs')
          .insert({
            provider_id: provider.id,
            order_id: order.id,
            request_data: { service_id, target },
            response_data: providerResponse,
            status_code: 200,
          });

        // Update order as completed
        await supabaseClient.rpc('process_order', {
          p_order_id: order.id,
          p_new_status: 'completed',
          p_provider_ref: providerResponse.reference,
        });

        success = true;
        break;
      } catch (error: any) {
        lastError = error.message;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        // Log failed attempt
        await supabaseClient
          .from('provider_logs')
          .insert({
            provider_id: null,
            order_id: order.id,
            request_data: { service_id, target, attempt: attempt + 1 },
            response_data: null,
            status_code: 0,
            error_message: lastError,
          });

        await supabaseClient
          .from('orders')
          .update({ retry_count: attempt + 1 })
          .eq('id', order.id);
      }
    }

    if (!success) {
      // Mark as failed and refund
      await supabaseClient.rpc('process_order', {
        p_order_id: order.id,
        p_new_status: 'failed',
        p_error_message: lastError,
      });

      return new Response(
        JSON.stringify({ error: 'Order failed after 3 attempts', details: lastError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, order }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function callProvider(provider: any, service: any, target: string) {
  // Mock provider implementation
  // In production, replace with actual API calls based on provider.config_json
  
  console.log(`Calling ${provider.name} API...`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock success response
  if (Math.random() > 0.1) { // 90% success rate
    return {
      success: true,
      reference: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Transaction successful',
    };
  } else {
    throw new Error('Provider API error');
  }
}

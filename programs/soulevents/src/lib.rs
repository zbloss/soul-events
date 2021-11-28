use anchor_lang::prelude::*;

declare_id!("DvBhWLgb8jDv57fDo1HXiNE59QkCU5T4zZikFADSL9N8");

#[program]
mod soulevents {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, user_name: String, bio: String, event_item: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.user_name = user_name;
        base_account.bio = bio;
        let copy = event_item.clone();
        base_account.event_list.push(copy);
        Ok(())
    }

    pub fn add_event(ctx: Context<Update>, event_item: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let event_item_copy = event_item.clone();
        base_account.event_list.push(event_item_copy);
        Ok(())
    }
}

// Transaction Instructions
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 64 + 64)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

#[account]
pub struct BaseAccount {
    pub user_name: String,
    pub bio: String,
    pub event_list: Vec<String>,
}
